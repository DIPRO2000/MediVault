import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Import Layout
import Layout from './Layout'

// Import your pages
import Home from './Pages/Home'
import About from './Pages/About'
import Contact from './Pages/Contact'
import Admin from './Pages/Admin'
import DoctorDashboard from './Pages/DoctorDashboard'
import PatientDashboard from './Pages/PatientDashboard'

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout wrapper for normal pages */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="doctordashboard" element={<DoctorDashboard />} />
          <Route path="patientdashboard" element={<PatientDashboard />} />
        </Route>

        {/* Route outside layout (no navbar/footer) */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App
