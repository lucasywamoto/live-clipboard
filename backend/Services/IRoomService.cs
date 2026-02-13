using System;
using backend.Models;

namespace backend.Services;

public interface IRoomService
{
    Task<string> CreateRoom();
    Task<Room?> GetRoomByCode(string code);
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
}