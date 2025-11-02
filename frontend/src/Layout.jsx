import { Outlet } from 'react-router-dom'
import Navbar from './components/Layouts/Navbar' // optional if you have it
import Footer from './components/Layouts/Footer' // optional too

function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet /> {/* This renders the current page */}
      </main>
      <Footer />
    </>
  )
}

export default Layout
