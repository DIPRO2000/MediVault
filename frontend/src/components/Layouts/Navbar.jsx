import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { createPageUrl } from "@/utils";

export default function Navbar({ onAuthOpen }) {
  const location = useLocation();

  const navigationItems = [
    { title: "Home", url: "/" },
    { title: "About", url: "/about" },
    { title: "Patient Dashboard", url: "/patientdashboard" },
    { title: "Doctor Dashboard", url: "/doctordashboard" },
    { title: "Admin", url: "/admin" },
    { title: "Contact", url: "/contact" },
  ];


  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to= {"/"}className="flex items-center gap-2 group">
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
            onClick={onAuthOpen}
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
  );
}
