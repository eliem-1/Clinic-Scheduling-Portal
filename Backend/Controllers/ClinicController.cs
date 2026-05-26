using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api")]
public class ClinicController : ControllerBase
{
    private readonly ClinicContext _context;

    public ClinicController(ClinicContext context)
    {
        _context = context;
    }

    // 🩺 Fetch all available doctors for the dropdown selection matrix
    [HttpGet("doctors")]
    public async Task<IActionResult> GetDoctors() => Ok(await _context.Doctors.ToListAsync());

    // 👤 Fetch all patients registered on the system ledger
    [HttpGet("patients")]
    public async Task<IActionResult> GetPatients() => Ok(await _context.Patients.ToListAsync());

    // 📅 Fetch appointments along with their fully joined relational data profiles
    [HttpGet("appointments")]
    public async Task<IActionResult> GetAppointments()
    {
        var appointments = await _context.Appointments
            .Include(a => a.Doctor)
            .Include(a => a.Patient)
            .ToListAsync();
        return Ok(appointments);
    }

    // ➕ Add a new Doctor to the database matrix
    [HttpPost("doctors")]
    public async Task<IActionResult> AddDoctor([FromBody] Doctor doctor)
    {
        if (string.IsNullOrWhiteSpace(doctor.Name) || string.IsNullOrWhiteSpace(doctor.Specialty))
        {
            return BadRequest(new { message = "Doctor name and specialty are required." });
        }

        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetDoctors), doctor);
    }

    // ➕ Register a brand new Patient into the system ledger
    [HttpPost("patients")]
    public async Task<IActionResult> AddPatient([FromBody] Patient patient)
    {
        if (string.IsNullOrWhiteSpace(patient.FullName) || string.IsNullOrWhiteSpace(patient.Email))
        {
            return BadRequest(new { message = "Patient name and email are required." });
        }

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPatients), patient);
    }

    // 🚀 THE CORE DOUBLE-BOOKING VALIDATION ENGINE
    [HttpPost("appointments")]
    public async Task<IActionResult> BookAppointment([FromBody] Appointment appointment)
    {
        var cleanTime = new DateTime(
            appointment.AppointmentTime.Year,
            appointment.AppointmentTime.Month,
            appointment.AppointmentTime.Day,
            appointment.AppointmentTime.Hour,
            0, 0, DateTimeKind.Utc
        );
        
        appointment.AppointmentTime = cleanTime;

        bool isDoubleBooked = await _context.Appointments.AnyAsync(a => 
            a.DoctorId == appointment.DoctorId && 
            a.AppointmentTime == cleanTime);

        if (isDoubleBooked)
        {
            return Conflict(new { message = "Scheduling Conflict: This Doctor is already booked at this hour." });
        }

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        var savedAppointment = await _context.Appointments
            .Include(a => a.Doctor)
            .Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.Id == appointment.Id);

        return CreatedAtAction(nameof(GetAppointments), savedAppointment);
    }

    // 🗑️ Delete/Cancel an active reservation by ID
    [HttpDelete("appointments/{id}")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null) return NotFound();

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}