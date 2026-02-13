using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Room
{
    public int Id { get; set; }
    [MaxLength(5)]
    public string Code { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }

    public List<ClipboardItem> ClipboardItems { get; set; } = new();
}