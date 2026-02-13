using System;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class ClipboardHub(IRoomService roomService, ApplicationDbContext dbContext) : Hub
{
    private readonly IRoomService _roomService = roomService;
    private readonly ApplicationDbContext _dbContext = dbContext;

    public async Task<string> CreateRoom()
    {
        string code = await _roomService.CreateRoom();
        return code;
    }

    public async Task<bool> JoinRoom(string code)
    {
        Room? room = await _roomService.GetRoomByCode(code);

        if (room == null)
        {
            return false;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, code);
        return true;
    }

    public async Task SendClipboardContent(string code, string content)
    {
        Room? room = await _roomService.GetRoomByCode(code);
        if (room == null) return;

        ClipboardItem item = new()
        {
            RoomId = room.Id,
            Content = _roomService.Encrypt(content),
            Timestamp = DateTime.UtcNow
        };

        _dbContext.ClipboardItems.Add(item);
        await _dbContext.SaveChangesAsync();

        await Clients.Group(code).SendAsync("ReceiveClipboardContent", content);
    }

    public async Task<List<string>> GetRoomHistory(string code)
    {
        Room? room = await _roomService.GetRoomByCode(code);
        if (room == null) return new List<string>();

        var items = _dbContext.ClipboardItems
            .Where(ci => ci.RoomId == room.Id)
            .OrderBy(ci => ci.Timestamp)
            .ToList();

        return [.. items.Select(i => _roomService.Decrypt(i.Content))];
    }
}
