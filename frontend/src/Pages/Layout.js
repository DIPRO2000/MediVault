import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Stethoscope, ShieldCheck } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({});

  const navigationItems = [
    { title: "Home", url: createPageUrl("Home") },
    { title: "About", url: createPageUrl("About") },
    { title: "Patient Dashboard", url: createPageUrl("PatientDashboard") },
    { title: "Doctor Dashboard", url: createPageUrl("DoctorDashboard") },
    { title: "Admin", url: createPageUrl("Admin") },
    { title: "Contact", url: createPageUrl("Contact") },
  ];

  const openAuthModal = () => {
    setAuthModalOpen(true);
    setActiveForm(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", activeForm, formData);
    setAuthModalOpen(false);
    setActiveForm(null);
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                MediVault
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === item.url
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Login/Register Button */}
            <Button
              onClick={openAuthModal}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Login / Register
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-blue-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.url
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {activeForm === null && "Welcome to MediVault"}
              {activeForm === "patient" && "Register as Patient"}
              {activeForm === "doctor" && "Register as Doctor"}
              {activeForm === "admin" && "Admin Login"}
            </DialogTitle>
          </DialogHeader>

          {activeForm === null && (
            <div className="space-y-3 py-4">
              <button
                onClick={() => setActiveForm("patient")}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Register as Patient</p>
                  <p className="text-sm text-gray-500">Manage your medical records</p>
                </div>
              </button>

              <button
                onClick={() => setActiveForm("doctor")}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-green-100 hover:border-green-300 hover:bg-green-50 transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Register as Doctor</p>
                  <p className="text-sm text-gray-500">Access patient records</p>
                </div>
              </button>

              <button
                onClick={() => setActiveForm("admin")}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all group"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Login as Admin</p>
                  <p className="text-sm text-gray-500">Manage system settings</p>
                </div>
              </button>
            </div>
          )}

          {activeForm === "patient" && (
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveForm(null)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Submit
                </Button>
              </div>
            </form>
          )}

          {activeForm === "doctor" && (
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="doctorName">Full Name</Label>
                <Input
                  id="doctorName"
                  placeholder="Dr. John Doe"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License / IPFS Hash</Label>
                <Input
                  id="license"
                  placeholder="QmX... or License Number"
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, specialization: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="general">General Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveForm(null)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  Submit
                </Button>
              </div>
            </form>
          )}

          {activeForm === "admin" && (
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Admin Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter admin password"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveForm(null)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Login
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
}