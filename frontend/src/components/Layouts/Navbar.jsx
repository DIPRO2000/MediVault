import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, AlertCircle, Activity, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pull from Vite env
const REQUIRED_CHAIN_ID = import.meta.env.VITE_REACT_APP_CHAIN_ID;
const REQUIRED_CHAIN_NAME = import.meta.env.VITE_REACT_APP_CHAIN_NAME;
const SERVER_URL = import.meta.env.VITE_BACKEND_URL;
const IS_LOCAL = window.location.hostname === "localhost";

export default function Navbar({ onAuthOpen }) {
  const location = useLocation();
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  
  // ✅ New State for Server Status
  const [serverStatus, setServerStatus] = useState("checking"); // 'online' | 'offline' | 'checking'

  const navigationItems = [
    { title: "Home", url: "/" },
    { title: "About", url: "/about" },
    { title: "Contact", url: "/contact" },
  ];

  // ✅ New Logic: Check Server Heartbeat
  const checkServerStatus = async () => {
    setServerStatus("checking");
    try {
      const response = await fetch(SERVER_URL);
      if (response.ok) setServerStatus("online");
      else setServerStatus("offline");
    } catch (err) {
      setServerStatus("offline");
    }
  };

  // ✅ 1. Logic to Switch Network
  const checkAndSwitchNetwork = async () => {
    if (!window.ethereum) return false;

    const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

    if (currentChainId !== REQUIRED_CHAIN_ID) {
      setIsWrongNetwork(true);
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: REQUIRED_CHAIN_ID }],
        });
        setIsWrongNetwork(false);
        return true;
      } catch (err) {
        const envName = IS_LOCAL ? "Ganache/Local" : "Sepolia";
        alert(`[Network Alert] Please switch to ${envName}. Your wallet is currently on the wrong network.`);
        return false;
      }
    }
    setIsWrongNetwork(false);
    return true;
  };

  // ✅ 2. Connection Flow
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected! Please install it to use MediVault.");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const isCorrect = await checkAndSwitchNetwork();
      if (isCorrect && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Connection cancelled or failed:", error);
    }
  };

  // ✅ 3. Monitor Wallet & Server Activity
  useEffect(() => {
    checkServerStatus(); // Initial server check

    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => window.location.reload());
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          window.ethereum.request({ method: "eth_chainId" }).then((id) => {
            setIsWrongNetwork(id !== REQUIRED_CHAIN_ID);
          });
        } else {
          setWalletAddress(null);
          setIsWrongNetwork(false);
        }
      });

      window.ethereum.request({ method: "eth_chainId" }).then((id) => {
        if (walletAddress) setIsWrongNetwork(id !== REQUIRED_CHAIN_ID);
      });
    }
  }, [walletAddress]);

  // ✅ 4. Gatekeeper for Login/Register
  const handleAuthClick = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    const isCorrect = await checkAndSwitchNetwork();
    if (isCorrect) onAuthOpen();
  };

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-50 shadow-sm">
      {/* Dynamic Network Warning Banner */}
      {isWrongNetwork && walletAddress && (
        <div className="bg-red-500 text-white text-center py-1.5 text-xs font-semibold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <AlertCircle size={14} />
          Switch to {REQUIRED_CHAIN_NAME} to access your medical records
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Network Note */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                MediVault
              </span>
            </Link>
            {/* Dynamic Network Short Note */}
            <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 ml-1">
              <Globe size={10} /> {REQUIRED_CHAIN_NAME}
            </span>
          </div>

          {/* Nav Links */}
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

          {/* Action Buttons & Status Indicators */}
          <div className="flex items-center gap-3">
            {/* Server Status Button */}
            <button
              onClick={checkServerStatus}
              title="Click to re-check server status"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[11px] font-bold uppercase tracking-wider transition-all
                ${serverStatus === 'online' ? 'border-green-100 bg-green-50 text-green-600' : 
                  serverStatus === 'offline' ? 'border-red-100 bg-red-50 text-red-600' : 
                  'border-gray-100 bg-gray-50 text-gray-500'}`}
            >
              <Activity size={12} className={serverStatus === 'online' ? 'animate-pulse' : ''} />
              {serverStatus === 'online' ? 'Server Live' : serverStatus === 'offline' ? 'Server Down' : 'Checking...'}
            </button>

            <Button
              onClick={handleAuthClick}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-200/50 shadow-md transition-all text-sm h-9"
            >
              Login
            </Button>

            <Button
              onClick={connectWallet}
              variant={isWrongNetwork ? "destructive" : "default"}
              className={`${
                !walletAddress ? "bg-slate-900" : isWrongNetwork ? "bg-red-600" : "bg-green-500 hover:bg-green-600"
              } text-white min-w-[130px] shadow-sm transition-all h-9 text-sm`}
            >
              {isWrongNetwork && walletAddress ? (
                <span className="flex items-center gap-2">
                  <AlertCircle size={14} /> Wrong Network
                </span>
              ) : walletAddress ? (
                shortAddress
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}