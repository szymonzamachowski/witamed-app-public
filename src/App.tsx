import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Matches from './pages/Matches'
import Attendance from './pages/Attendance'
import CalendarPage from './pages/Calendar'

function App() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
