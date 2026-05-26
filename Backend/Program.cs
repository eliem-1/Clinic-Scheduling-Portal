using Microsoft.EntityFrameworkCore;
using Backend.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Database Services and point it to an SQLite file named clinic.db
builder.Services.AddDbContext<ClinicContext>(options =>
    options.UseSqlite("Data Source=clinic.db"));

// 2. Add Controllers and prevent JSON infinite tracking loops
builder.Services.AddControllers().AddJsonOptions(options => {
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// 3. Configure Strict CORS Security so your React frontend application is allowed to talk to this API
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");
app.MapControllers();

// Automatically generate your database tables on startup if they don't exist yet
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ClinicContext>();
    db.Database.EnsureCreated();
}

app.Run();