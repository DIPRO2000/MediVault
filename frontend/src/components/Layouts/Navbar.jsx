import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";

export default function Navbar({ onAuthOpen }) {
  const location = useLocation();
  const [walletAddress, setWalletAddress] = useState(null);

  const navigationItems = [
    { title: "Home", url: "/" },
    { title: "About", url: "/about" },
    // { title: "Patient Dashboard", url: "/patientdashboard" },
    // { title: "Doctor Dashboard", url: "/doctordashboard" },
    // { title: "Admin", url: "/admin" },
    { title: "Contact", url: "/contact" },
  ];

  // ✅ Connect or Switch Wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install it first.");
        return;
      }

      // Always trigger the account selection popup
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // ✅ Handle account switching directly from MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  // ✅ Handle Login/Register click
  const handleAuthClick = () => {
    if (!walletAddress) {
      alert("Please connect your wallet first before login/register.");
      return;
    }
    onAuthOpen();
  };

  // ✅ Shorten address for UI
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
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

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {/* Login/Register Button */}
            <Button
              onClick={handleAuthClick}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Login / Register
            </Button>

            {/* Connect or Change Wallet Button */}
            <Button
              onClick={connectWallet}
              className={`${
                walletAddress
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-600 hover:bg-black"
              } text-white shadow-lg hover:shadow-xl transition-all`}
            >
              {walletAddress ? shortAddress : "Connect Wallet"}
            </Button>
          </div>
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
