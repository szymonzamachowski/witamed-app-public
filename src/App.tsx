import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import Attendance from './pages/Attendance'
import CalendarPage from './pages/Calendar'
import Statistics from './pages/Statistics'
import Login from './pages/Login'
import MyAccount from './pages/MyAccount'
import AdminPanel from './pages/AdminPanel'
import Install from './pages/Install'
import LastSeason from './pages/LastSeason'
import ArchiveMatchDetail from './pages/ArchiveMatchDetail'

function App() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/instalacja" element={<Install />} />
          <Route path="/zeszly-sezon" element={<LastSeason />} />
          <Route path="/zeszly-sezon/:id" element={<ArchiveMatchDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
