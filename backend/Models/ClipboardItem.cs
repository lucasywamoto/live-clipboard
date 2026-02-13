using System;

namespace backend.Models;

public class ClipboardItem
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }

    public Room Room { get; set; } = null!;
}
