using System;
using backend.Data;
using backend.Models;
using HashidsNet;

namespace backend.Services;

public class RoomService(ApplicationDbContext context, Hashids hashids) : IRoomService
{
    readonly ApplicationDbContext _context = context;
    readonly Hashids _hashids = hashids;


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

    public string Decrypt(string cipherText)
    {
        throw new NotImplementedException();
    }

    public string Encrypt(string plainText)
    {
        throw new NotImplementedException();
    }

    public Task<Room?> GetRoomByCode(string code)
    {
        throw new NotImplementedException();
    }
}
