import React, { useState } from "react";
import Navbar from "./Navbar";
import AuthModal from "./AuthModal";
import Footer from "./Footer";
import { registerPatient } from "@/utils/registerPatient.js";

export default function Layout({ children }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Hello:",activeForm);
    //console.log("Form submitted:", activeForm, formData);
    if(formData.mode === "patient"){
      try {
        await registerPatient(formData);
        alert("Patient registered successfully!");
      } catch (err) {
        console.error(err);
      }
    }
    setAuthModalOpen(false);
    setActiveForm(null);
    setFormData({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-white to-blue-50">
      <Navbar onAuthOpen={() => setAuthModalOpen(true)} />

      <AuthModal
        open={authModalOpen}
        setOpen={setAuthModalOpen}
        activeForm={activeForm}
        setActiveForm={setActiveForm}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />

      <main className="grow min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </div>
  );
}
