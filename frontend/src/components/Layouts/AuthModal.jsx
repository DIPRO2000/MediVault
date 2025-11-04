import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { User, Stethoscope, ShieldCheck, LogIn, UserPlus } from "lucide-react";

export default function AuthModal({
  open,
  setOpen,
  activeForm,
  setActiveForm,
  formData,
  setFormData,
  handleSubmit,
  loading,
}) {
  const [mode, setMode] = useState("register"); // "register" or "login"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {activeForm === null && "Welcome to MediVault"}
            {activeForm === "patient" &&
              (mode === "register" ? "Register as Patient" : "Login as Patient")}
            {activeForm === "doctor" &&
              (mode === "register" ? "Register as Doctor" : "Login as Doctor")}
            {activeForm === "admin" && "Admin Login"}
          </DialogTitle>
        </DialogHeader>

        {/* Initial Role Choice */}
        {activeForm === null && (
          <div className="space-y-3 py-4">
            <AuthButton
              color="blue"
              icon={<User className="w-6 h-6 text-blue-600" />}
              title="Patient Portal"
              subtitle="Register or login to access your records"
              onClick={() => setActiveForm("patient")}
            />
            <AuthButton
              color="green"
              icon={<Stethoscope className="w-6 h-6 text-green-600" />}
              title="Doctor Portal"
              subtitle="Access and manage patient data"
              onClick={() => setActiveForm("doctor")}
            />
            <AuthButton
              color="purple"
              icon={<ShieldCheck className="w-6 h-6 text-purple-600" />}
              title="Admin Panel"
              subtitle="Manage the system backend"
              onClick={() => setActiveForm("admin")}
            />
          </div>
        )}

        {/* Patient Form */}
        {activeForm === "patient" && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <ModeSwitch mode={mode} setMode={setMode} />

            {mode === "register" ? (
              <>
                <InputField
                  label="Full Name"
                  id="name"
                  placeholder="Enter your full name"
                  onChange={(v) => setFormData({ ...formData, name: v ,mode:mode})}
                />

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <InputField
                  label="Date of Birth"
                  id="dob"
                  type="date"
                  onChange={(v) => setFormData({ ...formData, dob: v })}
                />

                {/* ✅ Blood Group Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}>
                    <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <InputField
                  label="Contact Number"
                  id="contact"
                  type="tel"
                  placeholder="+91 99999 99999"
                  onChange={(v) => setFormData({ ...formData, contact: v })}
                />

                <InputField
                  label="Home Address"
                  id="address"
                  placeholder="Enter your full home address"
                  onChange={(v) => setFormData({ ...formData, address: v })}
                />
              </>
            ) : (
              <p className="text-gray-600 text-sm">
                To log in, please connect your wallet. Your account will be verified automatically.
              </p>
            )}

            <FormButtons
              onCancel={() => setActiveForm(null)}
              color="blue"
              text={mode === "register" ? "Submit" : "Verify"}
              loading={loading}
              disabled={loading}
            />
          </form>
        )}

        {/* Doctor Form */}
        {activeForm === "doctor" && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <ModeSwitch mode={mode} setMode={setMode} />

            {mode === "register" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Full Name *"
                    id="doctorName"
                    placeholder="Dr. John Doe"
                    required
                    onChange={(v) => setFormData({ ...formData, name: v, mode: mode })}
                  />
                  
                  <InputField
                    label="Degree *"
                    id="degree"
                    placeholder="MBBS, MD, MS, etc."
                    required
                    onChange={(v) => setFormData({ ...formData, degree: v })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Select 
                      required
                      onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="general">General Medicine</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                        <SelectItem value="dentistry">Dentistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <InputField
                    label="License Number"
                    id="licenseNumber"
                    placeholder="MED123456"
                    onChange={(v) => setFormData({ ...formData, licenseNumber: v })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Years of Experience"
                    id="experience"
                    placeholder="5"
                    type="number"
                    min="0"
                    max="50"
                    onChange={(v) => setFormData({ ...formData, experience: v })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact Information</Label>
                  <textarea
                    id="contactInfo"
                    placeholder="Email: doctor@hospital.com&#10;Phone: +1-234-567-8900"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Enter email, phone, or other contact details</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Doctor Registration:</strong> Your professional information will be stored securely on IPFS and verified on the blockchain.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  To log in, connect your wallet. If this wallet is registered as a doctor, you'll be redirected to your dashboard.
                </p>
              </div>
            )}

            <FormButtons 
              onCancel={() => setActiveForm(null)} 
              color="green" 
              text={mode === "register" ? "Register as Doctor" : "Verify & Login"}
              loading={loading}
              disabled={loading}
            />
          </form>
        )}

        {/* Admin Login */}
        {activeForm === "admin" && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <ModeSwitch mode={mode} setMode={setMode} />
            
            {mode === "register" ? (
              <p className="text-gray-600 text-sm">
                Admin registration is not available through this portal.
              </p>
            ) : (
              <>
                <InputField
                  label="Admin Password"
                  id="adminPassword"
                  type="password"
                  placeholder="Enter admin password"
                  onChange={(v) => setFormData({ ...formData, password: v })}
                />
                <FormButtons 
                  onCancel={() => setActiveForm(null)} 
                  color="purple" 
                  text="Login as Admin"
                  loading={loading}
                  disabled={loading}
                />
              </>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------

function AuthButton({ color, icon, title, subtitle, onClick }) {
  // Fixed color classes - Tailwind needs explicit classes
  const colorClasses = {
    blue: { border: 'border-blue-100 hover:border-blue-300 hover:bg-blue-50', bg: 'bg-blue-100 hover:bg-blue-200' },
    green: { border: 'border-green-100 hover:border-green-300 hover:bg-green-50', bg: 'bg-green-100 hover:bg-green-200' },
    purple: { border: 'border-purple-100 hover:border-purple-300 hover:bg-purple-50', bg: 'bg-purple-100 hover:bg-purple-200' }
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 ${classes.border} transition-all group`}
    >
      <div className={`w-12 h-12 ${classes.bg} rounded-lg flex items-center justify-center transition-colors`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </button>
  );
}

function InputField({ label, id, type = "text", placeholder, onChange, required = false }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input 
        id={id} 
        type={type} 
        placeholder={placeholder} 
        onChange={(e) => onChange(e.target.value)} 
        required={required} 
      />
    </div>
  );
}

function FormButtons({ onCancel, color, text, loading = false, disabled = false }) {
  // Fixed color classes for buttons
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  const buttonClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="flex gap-3 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel} 
        disabled={loading}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        className={`flex-1 ${buttonClass} text-white`}
        disabled={loading || disabled}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Processing...
          </>
        ) : (
          text
        )}
      </Button>
    </div>
  );
}

function ModeSwitch({ mode, setMode }) {
  return (
    <div className="flex justify-center gap-3 pb-2">
      <Button
        type="button"
        variant={mode === "register" ? "default" : "outline"}
        className="flex items-center gap-2"
        onClick={() => setMode("register")}
      >
        <UserPlus className="w-4 h-4" /> Register
      </Button>
      <Button
        type="button"
        variant={mode === "login" ? "default" : "outline"}
        className="flex items-center gap-2"
        onClick={() => setMode("login")}
      >
        <LogIn className="w-4 h-4" /> Login
      </Button>
    </div>
  );
}