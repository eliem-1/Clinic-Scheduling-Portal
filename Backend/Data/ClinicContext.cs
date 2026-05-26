using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class ClinicContext : DbContext
{
    public ClinicContext(DbContextOptions<ClinicContext> options) : base(options) { }

    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed some initial demo data so our UI isn't empty
        modelBuilder.Entity<Doctor>().HasData(
            new Doctor { Id = 1, Name = "Dr. Sarah Jenkins", Specialty = "Cardiology" },
            new Doctor { Id = 2, Name = "Dr. Alex Rivera", Specialty = "Dermatology" },
            new Doctor { Id = 3, Name = "Dr. Emily Chen", Specialty = "Pediatrics" }
        );

        modelBuilder.Entity<Patient>().HasData(
            new Patient { Id = 1, FullName = "John Doe", Email = "john@example.com" }
        );
    }
}