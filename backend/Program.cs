
using backend.Data;
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

        var app = builder.Build();

        app.UseHttpsRedirection();

        app.Run();
    }
}
