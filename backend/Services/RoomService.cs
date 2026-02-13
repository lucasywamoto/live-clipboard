using System;
using backend.Models;

namespace backend.Services;

public class RoomService : IRoomService
{
    public Task<string> CreateRoom()
    {
        throw new NotImplementedException();
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
