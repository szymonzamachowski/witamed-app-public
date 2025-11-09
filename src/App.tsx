import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import Attendance from './pages/Attendance'
import CalendarPage from './pages/Calendar'
import Statistics from './pages/Statistics'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import MyAccount from './pages/MyAccount'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
