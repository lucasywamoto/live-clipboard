
using backend.Data;
using backend.Hubs;
using backend.Services;
using HashidsNet;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddSignalR();

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddSingleton(new Hashids(builder.Configuration["HashSalt:Value"] ?? throw new InvalidOperationException("HashSalt not found in configuration"), 5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"));

        builder.Services.AddScoped<IRoomService, RoomService>();

        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:5173", "http://localhost:3000"];

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("ReactApp", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        var app = builder.Build();

        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.ExecuteSqlRaw("PRAGMA journal_mode=WAL;");
        }

        app.UseHttpsRedirection();

        app.UseCors("ReactApp");

        app.MapHub<ClipboardHub>("/clipboardhub");

        app.Run();
    }
}
