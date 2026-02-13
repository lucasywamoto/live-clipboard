using System;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;
using HashidsNet;

namespace backend.Services;

public class RoomService(ApplicationDbContext context, Hashids hashids, IConfiguration configuration) : IRoomService
{
    readonly ApplicationDbContext _context = context;
    readonly Hashids _hashids = hashids;
    private readonly byte[] _encryptionKey = Convert.FromBase64String(configuration["Encryption:Key"] ?? throw new InvalidOperationException("EncryptionKey not found in configuration"));


    public Task<string> CreateRoom()
    {
        Room room = new()
        {
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        _context.Rooms.Add(room);
        _context.SaveChanges();

        string code = _hashids.Encode(room.Id);

        if (code.Length > 5)
        {
            throw new InvalidOperationException($"Generated code exceeds 5 characters: {code}");
        }

        room.Code = code;

        _context.SaveChanges();

        return Task.FromResult(room.Code);
    }

    public Task<Room?> GetRoomByCode(string code)
    {
        try
        {
            int roomId = _hashids.DecodeSingle(code);

            Room? room = _context.Rooms.Find(roomId);
            if (room == null || room.ExpiresAt < DateTime.UtcNow)
            {
                return Task.FromResult<Room?>(null);
            }

            return Task.FromResult<Room?>(room);
        }
        catch
        {
            return Task.FromResult<Room?>(null);
        }
    }

    public string Encrypt(string plainText)
    {
        using Aes aes = Aes.Create();
        aes.Key = _encryptionKey;
        aes.GenerateIV();

        ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);

        byte[] encryptedBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);


        byte[] result = new byte[aes.IV.Length + encryptedBytes.Length];
        Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
        Buffer.BlockCopy(encryptedBytes, 0, result, aes.IV.Length, encryptedBytes.Length);

        return Convert.ToBase64String(result);
    }

    public string Decrypt(string cipherText)
    {
        byte[] cipherBytes = Convert.FromBase64String(cipherText);

        using Aes aes = Aes.Create();
        aes.Key = _encryptionKey;

        byte[] iv = new byte[aes.BlockSize / 8];
        Buffer.BlockCopy(cipherBytes, 0, iv, 0, iv.Length);
        aes.IV = iv;

        ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

        byte[] encryptedBytes = new byte[cipherBytes.Length - iv.Length];
        Buffer.BlockCopy(cipherBytes, iv.Length, encryptedBytes, 0, encryptedBytes.Length);

        byte[] decryptedBytes = decryptor.TransformFinalBlock(encryptedBytes, 0, encryptedBytes.Length);

        return Encoding.UTF8.GetString(decryptedBytes);
    }

}
