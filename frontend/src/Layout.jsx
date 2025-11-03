import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Layouts/Navbar";
import Footer from "./components/Layouts/Footer";
import AuthModal from "./components/Layouts/AuthModal";

export default function Layout() {
  const [authOpen, setAuthOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <>
      <Navbar onAuthOpen={() => setAuthOpen(true)} />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        open={authOpen}
        setOpen={setAuthOpen}
        activeForm={activeForm}
        setActiveForm={setActiveForm}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />
    </>
  );
}
