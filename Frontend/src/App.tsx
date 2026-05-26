import { useState, useEffect } from 'react';
import { Calendar, User, UserCheck, Clock, FileText, Trash2, CheckCircle, AlertTriangle, UserPlus, Stethoscope } from 'lucide-react';
import type { Doctor, Patient, Appointment } from './types';

const API_BASE = "http://localhost:5250/api"; 

export default function App() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Core Booking Parameters State
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedHour, setSelectedHour] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Dynamic Multi-Registry Creation Inputs
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newPatientEmail, setNewPatientEmail] = useState<string>('');
  const [newDoctorName, setNewDoctorName] = useState<string>('');
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState<string>('');

  // Universal Notification Status Hooks
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const businessHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

  useEffect(() => {
    fetch(`${API_BASE}/doctors`).then(res => res.json()).then(setDoctors);
    fetch(`${API_BASE}/patients`).then(res => res.json()).then(setPatients);
    fetch(`${API_BASE}/appointments`).then(res => res.json()).then(setAppointments);
  }, []);

  const isSlotTaken = (doctorId: number, dateStr: string, hourStr: string) => {
    return appointments.some(app => {
      const appDate = new Date(app.appointmentTime);
      const targetDate = new Date(`${dateStr}T${hourStr}:00`);
      return app.doctorId === doctorId && appDate.getTime() === targetDate.getTime();
    });
  };

  // Handler: Register New Patient Form Pipeline
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newPatientName || !newPatientEmail) return setError('Please fulfill all patient tracking fields.');

    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: newPatientName, email: newPatientEmail })
      });
      if (!res.ok) throw new Error('Database refused patient registry item execution.');
      const data = await res.json();
      setPatients([...patients, data]);
      setSuccess(`Patient "${data.fullName}" has been logged successfully!`);
      setNewPatientName(''); setNewPatientEmail('');
    } catch (err: any) { setError(err.message); }
  };

  // Handler: Register New Doctor Form Pipeline
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newDoctorName || !newDoctorSpecialty) return setError('Please fulfill all practitioner structural metrics.');

    try {
      const res = await fetch(`${API_BASE}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDoctorName, specialty: newDoctorSpecialty })
      });
      if (!res.ok) throw new Error('Database refused doctor ledger entry compilation.');
      const data = await res.json();
      setDoctors([...doctors, data]);
      setSuccess(`Dr. ${data.name} added onto the clinic tracking matrices!`);
      setNewDoctorName(''); setNewDoctorSpecialty('');
    } catch (err: any) { setError(err.message); }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!selectedDoctor || !selectedPatient || !selectedDate || !selectedHour) {
      setError('Please select a patient, doctor, date, and time slot.');
      return;
    }

    const targetDateTime = `${selectedDate}T${selectedHour}:00.000Z`;

    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: parseInt(selectedDoctor),
          patientId: parseInt(selectedPatient),
          appointmentTime: targetDateTime,
          notes: notes
        })
      });

      if (response.status === 409) {
        const errData = await response.json();
        setError(errData.message);
        return;
      }

      if (!response.ok) throw new Error('Could not secure scheduling slot.');

      const newAppointment = await response.json();
      setAppointments([...appointments, newAppointment]);
      setSuccess('Appointment successfully secured!');
      setNotes(''); setSelectedHour('');
    } catch (err: any) { setError(err.make || 'Server connection terminated.'); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you certain you want to clear this active reservation?')) return;
    try {
      const response = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Cancellation failure response returned.');
      setAppointments(appointments.filter(app => app.id !== id));
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Calendar size={32} color="#38bdf8" />
        <h1 style={styles.title}>Clinic Scheduling Engine</h1>
      </header>

      {error && <div style={styles.errorBanner}><AlertTriangle size={18} /> {error}</div>}
      {success && <div style={styles.successBanner}><CheckCircle size={18} /> {success}</div>}

      {/* TOP CONFIGURATION BOX ROW */}
      <div style={styles.managementRow}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}><UserPlus size={18} style={{marginRight:8}}/> Register New Patient</h2>
          <form onSubmit={handleAddPatient} style={styles.horizontalForm}>
            <input type="text" placeholder="Full Name" style={styles.input} value={newPatientName} onChange={e => setNewPatientName(e.target.value)} />
            <input type="email" placeholder="Email Address" style={styles.input} value={newPatientEmail} onChange={e => setNewPatientEmail(e.target.value)} />
            <button type="submit" style={styles.addBtn}>Add Patient</button>
          </form>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}><Stethoscope size={18} style={{marginRight:8}}/> Onboard New Doctor</h2>
          <form onSubmit={handleAddDoctor} style={styles.horizontalForm}>
            <input type="text" placeholder="Dr. Name" style={styles.input} value={newDoctorName} onChange={e => setNewDoctorName(e.target.value)} />
            <input type="text" placeholder="Specialty (e.g. Cardiology)" style={styles.input} value={newDoctorSpecialty} onChange={e => setNewDoctorSpecialty(e.target.value)} />
            <button type="submit" style={styles.addBtn}>Add Doctor</button>
          </form>
        </section>
      </div>

      <div style={styles.layoutGrid}>
        {/* SCHEDULING DISPATCH INTERFACE */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Schedule Appointment</h2>
          <form onSubmit={handleBook} style={styles.form}>
            
            <label style={styles.label}><UserCheck size={16} /> Select Patient</label>
            <select style={styles.select} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
              <option value="">-- Choose Patient --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>)}
            </select>

            <label style={styles.label}><User size={16} /> Select Practitioner</label>
            <select style={styles.select} value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
              <option value="">-- Choose Doctor --</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>)}
            </select>

            <label style={styles.label}><Calendar size={16} /> Select Date</label>
            <input type="date" style={styles.input} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />

            {selectedDoctor && selectedDate && (
              <>
                <label style={styles.label}><Clock size={16} /> Select Hourly Slot</label>
                <div style={styles.timeMatrix}>
                  {businessHours.map(hour => {
                    const taken = isSlotTaken(parseInt(selectedDoctor), selectedDate, hour);
                    const isCurrent = selectedHour === hour;
                    return (
                      <button
                        type="button"
                        key={hour}
                        disabled={taken}
                        onClick={() => setSelectedHour(hour)}
                        style={{
                          ...styles.timeButton,
                          ...(taken ? styles.timeTaken : {}),
                          ...(isCurrent ? styles.timeSelected : {})
                        }}
                      >
                        {hour} {taken ? '(Full)' : '(Open)'}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <label style={styles.label}><FileText size={16} /> Consultation Notes</label>
            <textarea style={styles.textarea} placeholder="State reason for patient visit..." value={notes} onChange={e => setNotes(e.target.value)} />
            <button type="submit" style={styles.submitBtn}>Confirm Reservation Slot</button>
          </form>
        </section>

        {/* MONITORING LIVE MANAGEMENT LEDGER */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Active Appointments ({appointments.length})</h2>
          <div style={styles.appointmentList}>
            {appointments.length === 0 ? (
              <p style={styles.emptyText}>No upcoming appointments registered on ledger.</p>
            ) : (
              appointments.map(app => (
                <div key={app.id} style={styles.appCard}>
                  <div>
                    <h3 style={styles.appDoctor}>{app.doctor?.name}</h3>
                    <p style={styles.appPatient}>Patient: <strong>{app.patient?.fullName}</strong></p>
                    <p style={styles.appTime}>
                      <Clock size={14} style={{ marginRight: 4 }} />
                      {new Date(app.appointmentTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {app.notes && <p style={styles.appNotes}>"{app.notes}"</p>}
                  </div>
                  <button onClick={() => handleCancel(app.id)} style={styles.deleteBtn}><Trash2 size={16} /></button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' },
  title: { fontSize: '1.75rem', fontWeight: 'bold', color: '#f8fafc', margin: 0 },
  managementRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' },
  horizontalForm: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  layoutGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' },
  card: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', display: 'flex', flexDirection: 'column' },
  cardTitle: { fontSize: '1.15rem', marginBottom: '1.2rem', color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', fontWeight: 600 },
  select: { backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #475569', padding: '0.6rem', borderRadius: '6px', outline: 'none', flex: 1, minWidth: '150px' },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #475569', padding: '0.6rem', borderRadius: '6px', outline: 'none', flex: 1, minWidth: '150px' },
  addBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  timeMatrix: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' },
  timeButton: { backgroundColor: '#0f172a', color: '#4ade80', border: '1px solid #22c55e', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' },
  timeTaken: { backgroundColor: '#334155', color: '#64748b', borderColor: '#475569', cursor: 'not-allowed' },
  timeSelected: { backgroundColor: '#38bdf8', color: '#0f172a', borderColor: '#0284c7', fontWeight: 'bold' },
  textarea: { backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #475569', padding: '0.6rem', borderRadius: '6px', height: '80px', resize: 'none', outline: 'none' },
  submitBtn: { backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' },
  appointmentList: { display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '550px', overflowY: 'auto' },
  emptyText: { color: '#64748b', fontStyle: 'italic' },
  appCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #38bdf8' },
  appDoctor: { margin: '0 0 0.25rem 0', fontSize: '1rem', color: '#f8fafc' },
  appPatient: { margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#94a3b8' },
  appTime: { margin: '0 0 0.5rem 0', fontSize: '0.825rem', color: '#38bdf8', display: 'flex', alignItems: 'center' },
  appNotes: { margin: 0, fontSize: '0.825rem', color: '#cbd5e1', fontStyle: 'italic', backgroundColor: '#1e293b', padding: '0.4rem', borderRadius: '4px' },
  deleteBtn: { backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' },
  errorBanner: { backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  successBanner: { backgroundColor: '#064e3b', color: '#6ee7b7', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }
};