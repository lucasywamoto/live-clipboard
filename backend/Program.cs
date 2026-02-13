
using backend.Data;
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

        var app = builder.Build();

        app.UseHttpsRedirection();

        app.Run();
    }
}
