import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Stethoscope, ShieldCheck } from "lucide-react";

export default function AuthModal({ open, setOpen, activeForm, setActiveForm, formData, setFormData, handleSubmit }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {activeForm === null && "Welcome to MediVault"}
            {activeForm === "patient" && "Register as Patient"}
            {activeForm === "doctor" && "Register as Doctor"}
            {activeForm === "admin" && "Admin Login"}
          </DialogTitle>
        </DialogHeader>

        {/* Initial choice */}
        {activeForm === null && (
          <div className="space-y-3 py-4">
            <AuthButton
              color="blue"
              icon={<User className="w-6 h-6 text-blue-600" />}
              title="Register as Patient"
              subtitle="Manage your medical records"
              onClick={() => setActiveForm("patient")}
            />
            <AuthButton
              color="green"
              icon={<Stethoscope className="w-6 h-6 text-green-600" />}
              title="Register as Doctor"
              subtitle="Access patient records"
              onClick={() => setActiveForm("doctor")}
            />
            <AuthButton
              color="purple"
              icon={<ShieldCheck className="w-6 h-6 text-purple-600" />}
              title="Login as Admin"
              subtitle="Manage system settings"
              onClick={() => setActiveForm("admin")}
            />
          </div>
        )}

        {/* Patient Form */}
        {activeForm === "patient" && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <InputField label="Full Name" id="name" placeholder="Enter your full name" onChange={(v) => setFormData({ ...formData, name: v })} />
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
            <InputField label="Date of Birth" id="dob" type="date" onChange={(v) => setFormData({ ...formData, dob: v })} />
            <InputField label="Contact Number" id="contact" type="tel" placeholder="+1 (555) 000-0000" onChange={(v) => setFormData({ ...formData, contact: v })} />

            <FormButtons onCancel={() => setActiveForm(null)} color="blue" />
          </form>
        )}

        {/* Doctor Form */}
        {activeForm === "doctor" && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <InputField label="Full Name" id="doctorName" placeholder="Dr. John Doe" onChange={(v) => setFormData({ ...formData, name: v })} />
            <InputField label="License / IPFS Hash" id="license" placeholder="QmX... or License Number" onChange={(v) => setFormData({ ...formData, license: v })} />
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, specialization: value })}>
                <SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="general">General Medicine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormButtons onCancel={() => setActiveForm(null)} color="green" />
          </form>
        )}

        {/* Admin Login */}
        {activeForm === "admin" && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <InputField
              label="Admin Password"
              id="adminPassword"
              type="password"
              placeholder="Enter admin password"
              onChange={(v) => setFormData({ ...formData, password: v })}
            />
            <FormButtons onCancel={() => setActiveForm(null)} color="purple" />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AuthButton({ color, icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 border-${color}-100 hover:border-${color}-300 hover:bg-${color}-50 transition-all group`}
    >
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center group-hover:bg-${color}-200 transition-colors`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </button>
  );
}

function InputField({ label, id, type = "text", placeholder, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}

function FormButtons({ onCancel, color }) {
  return (
    <div className="flex gap-3 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      <Button type="submit" className={`flex-1 bg-${color}-600 hover:bg-${color}-700 text-white`}>Submit</Button>
    </div>
  );
}
