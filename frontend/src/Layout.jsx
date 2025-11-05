import { act, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom"; // Add useNavigate
import { ethers } from "ethers";
import Navbar from "./components/Layouts/Navbar";
import Footer from "./components/Layouts/Footer";
import AuthModal from "./components/Layouts/AuthModal";
import { registerPatient } from "./utils/registerPatient";
import { registerDoctor } from "./utils/registerDoctor";
import { CONTRACTS } from "./config/contracts";

export default function Layout() {
  const [authOpen, setAuthOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Add navigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Form Data Submitted:", formData);
      if (activeForm === "patient") {
        if (formData.mode === "register") {
          await registerPatient(formData);
          alert("Patient registered successfully!");
          navigate("/patientDashboard");
        } else {
          // Login logic for patient
          // Add your patient login verification here
          const isVerified = await verifyPatient(); // You need to implement this
          if (isVerified) {
            navigate("/patientDashboard");
          } else {
            alert("Patient not found or not registered.");
          }
        }
        
      } else if (activeForm === "doctor") {
        if (formData.mode === "register") {
          const result = await registerDoctor(formData);
          alert(`✅ Doctor registered successfully!\n\nIPFS Hash: ${result.ipfsHash}\nTransaction: ${result.txHash}`);
          navigate("/doctordashboard");
        } else {
          // Login logic for doctor
          // Add your doctor login verification here
          const isVerified = await verifyDoctor(); // You need to implement this
          if (isVerified) {
            navigate("/doctordashboard");
          } else {
            alert("Doctor not found or not registered.");
          }
        }
      } else if (activeForm === "admin") {
        // Admin Login here

        const isVerified = await verifyAdmin();
        if (isVerified) {
          navigate("/admin");
        }
        else {
          alert("Admin authentication failed.");
          navigate("/");
        }
      }
      
      // Close modal and reset form after successful registration/login
      setFormData({});
      setActiveForm(null);
      setAuthOpen(false);
      
    } catch (err) {
      console.error("Operation failed:", err);
      alert(`❌ Operation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
        loading={loading}
      />
    </>
  );
}




// Add these verification functions
export const verifyPatient = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    const patientContract = new ethers.Contract(
      CONTRACTS.patient.address,
      CONTRACTS.patient.abi,
      signer
    );

    const patientInfo = await patientContract.patients(userAddress);
    return patientInfo.isRegistered;
  } catch (error) {
    console.error("Error verifying patient:", error);
    return false;
  }
};

export const verifyDoctor = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    const doctorContract = new ethers.Contract(
      CONTRACTS.doctor.address,
      CONTRACTS.doctor.abi,
      signer
    );

    const doctorInfo = await doctorContract.doctors(userAddress);
    return doctorInfo.registered;
  } catch (error) {
    console.error("Error verifying doctor:", error);
    return false;
  }
};

export const verifyAdmin = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    const doctorContract = new ethers.Contract(
      CONTRACTS.doctor.address,
      CONTRACTS.doctor.abi,
      signer
    );

    const contractAdmin = await doctorContract.admin();
    return userAddress.toLocaleLowerCase() === contractAdmin.toLocaleLowerCase();

  } catch (error) {
    console.error("Error verifying admin:", error);
    return false;
  }
}