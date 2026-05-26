# 🩺 Clinic Scheduling Portal

A modern, decoupled full-stack appointment scheduling application built using an asynchronous **.NET Web API** backend and a responsive **React + TypeScript** frontend. The system features a custom time-slot matrix and real-time backend validation to prevent patient/practitioner double-booking conflicts.

---

## 🏗️ System Architecture

The application is split into two completely isolated layers communicating over a lightweight RESTful API layer:

* **Backend Engine:** Built with C# and ASP.NET Core. It utilizes **Entity Framework Core** coupled with an **SQLite** relational database instance. It enforces critical business rules using database interception (`.AnyAsync()`) to guarantee scheduling integrity.
* **Client Dashboard:** Built with React, Vite, and TypeScript. Styled with a custom minimalist dark mode theme using **Lucide React** vectors for clean data telemetry.

---

## 🚀 Getting Started

Follow these steps to run both halves of the application locally on your machine.

### 📋 Prerequisites
* [.NET Core SDK](https://dotnet.microsoft.com/download) (Version 8.0 or newer)
* [Node.js](https://nodejs.org/) (LTS version)

### 🛠️ 1. Booting the Backend API Server
1. Open a terminal and navigate to the backend subdirectory:
   cd Backend
2. Restore required NuGet dependencies and boot up the hot-reload server:
   dotnet run
3. The server will spin up and listen for requests at: http://localhost:5250

### 🎨 2. Launching the Frontend User Interface
1. Open a second, separate terminal window and change directories to the frontend folder:
   cd Frontend
2. Install the frontend Node module dependencies:
   npm install
3. Fire up the Vite reactive development layout engine:
   npm run dev
4. Open your browser and navigate to the local link printed in your terminal (usually http://localhost:5174 or http://localhost:5173).

---

## ⚡ Key Core Features

* **Dynamic Metadata Onboarding:** Register new patients and onboard practitioners directly from the frontend dashboard; dropdown matrices sync immediately without requiring hard page refreshes.
* **Hourly Time-Slot Matrix:** Automatically evaluates incoming appointment payloads, marking hours as (Full) or (Open) based on doctor availability.
* **Double-Booking Prevention Guard:** Intercepts duplicate registration attempts on the server side, throwing a clean HTTP 409 Conflict warning back to the user interface if a collision occurs.
* **Asynchronous Cancellation Ledger:** Instantly purge active reservations off the ledger with immediate database sync cascading.
