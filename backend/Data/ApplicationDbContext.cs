using System;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Room> Rooms { get; set; } = null!;
    public DbSet<ClipboardItem> ClipboardItems { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Room>(entity =>
         {
             entity.HasKey(e => e.Id);
             entity.HasIndex(e => e.Code).IsUnique();
             entity.Property(e => e.Code).IsRequired().HasMaxLength(5);
         });

        modelBuilder.Entity<ClipboardItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Room)
                  .WithMany(r => r.ClipboardItems)
                  .HasForeignKey(e => e.RoomId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
