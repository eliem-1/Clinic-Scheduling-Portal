using System;

namespace Backend.Models;

public class Appointment
{
    public int Id { get; set; }
    
    // Foreign Keys linking to Doctor and Patient
    public int DoctorId { get; set; }
    public Doctor? Doctor { get; set; }

    public int PatientId { get; set; }
    public Patient? Patient { get; set; }

    // Crucial: We store appointments on clean hourly slots
    public DateTime AppointmentTime { get; set; }
    public string Notes { get; set; } = string.Empty;
}