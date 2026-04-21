import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, UserCheck, Activity, FileText, Users, CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";
import { CONTRACTS } from "@/config/contracts";

export default function Admin() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAddress, setAdminAddress] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [updatingDoctor, setUpdatingDoctor] = useState(null);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    verifiedDoctors: 0,
    totalPatients: 0,
    totalRecords: 0
  });

  // Check if connected wallet is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask!");
          navigate("/");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setUserAddress(userAddress);

        const doctorContract = new ethers.Contract(
          CONTRACTS.doctor.address,
          CONTRACTS.doctor.abi,
          signer
        );

        // Get admin address from contract
        const contractAdmin = await doctorContract.admin();
        setAdminAddress(contractAdmin);

        // Check if connected wallet is admin
        if (userAddress.toLowerCase() !== contractAdmin.toLowerCase()) {
          alert("Access denied! Only admin can access this dashboard.");
          navigate("/");
          return;
        }

        setIsAdmin(true);
        console.log("Admin verified:", userAddress);

      } catch (err) {
        console.error("Admin verification failed:", err);
        alert("Could not verify admin access. Please reconnect your wallet.");
        navigate("/");
      }
    };

    checkAdmin();
  }, [navigate]);

  // Fetch all doctors data
  useEffect(() => {
    const fetchAllData = async () => {
      if (!isAdmin) return;

      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching all data...");
        
        // Fetch doctors data
        const doctorsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/alldoctors`);
        
        if (!doctorsResponse.ok) {
          throw new Error(`Doctors API error! status: ${doctorsResponse.status}`);
        }

        const doctorsData = await doctorsResponse.json();
        
        if (!doctorsData.success) {
          throw new Error(doctorsData.error || "Failed to fetch doctors data");
        }

        console.log("Doctors data fetched successfully:", doctorsData);
        
        // Fetch patient registry stats
        const statsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ipfs/patientregistrystats`);
        
        if (!statsResponse.ok) {
          throw new Error(`Stats API error! status: ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();
        
        if (!statsData.success) {
          throw new Error(statsData.error || "Failed to fetch patient stats");
        }

        console.log("Patient stats fetched successfully:", statsData);

        // Transform doctors data to match component structure
        const transformedDoctors = doctorsData.doctors.map((doctor, index) => ({
          id: index + 1,
          name: doctor.metadata.name,
          specialization: doctor.metadata.specialization,
          licenseHash: doctor.ipfsHash ? `${doctor.ipfsHash.substring(0, 20)}...` : "Not available",
          walletAddress: `${doctor.address.substring(0, 6)}...${doctor.address.substring(38)}`,
          fullAddress: doctor.address,
          verified: doctor.verified,
          joinDate: new Date(doctor.metadata.timestamp).toLocaleDateString(),
          degree: doctor.metadata.degree,
          licenseNumber: doctor.metadata.licenseNumber,
          experience: doctor.metadata.experience,
          contactInfo: doctor.metadata.contactInfo,
          ipfsHash: doctor.ipfsHash,
          metadata: doctor.metadata
        }));

        setDoctors(transformedDoctors);
        
        // Update stats with real data from both APIs
        setStats({
          totalDoctors: doctorsData.totalDoctors,
          verifiedDoctors: transformedDoctors.filter(d => d.verified).length,
          totalPatients: parseInt(statsData.data.totalPatients) || 0,
          totalRecords: parseInt(statsData.data.totalRecords) || 0
        });

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [isAdmin]);

  const handleVerificationToggle = async (doctorId, newStatus) => {
    try {
      setUpdatingDoctor(doctorId);
      const doctor = doctors.find(d => d.id === doctorId);
      if (!doctor) return;

      console.log(`Updating verification for doctor ${doctor.name} to: ${newStatus}`);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const doctorContract = new ethers.Contract(
        CONTRACTS.doctor.address,
        CONTRACTS.doctor.abi,
        signer
      );

      // Call the verifyDoctor function from your contract
      const tx = await doctorContract.verifyDoctor(doctor.fullAddress);
      
      console.log("Verify doctor transaction sent:", tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Update local state after successful blockchain update
      setDoctors(doctors.map(doc => {
        if (doc.id === doctorId) {
          const updatedDoctor = { ...doc, verified: true };
          
          // Update stats
          setStats(prevStats => ({
            ...prevStats,
            verifiedDoctors: prevStats.verifiedDoctors + 1
          }));

          return updatedDoctor;
        }
        return doc;
      }));

      alert(`${doctor.name} verified successfully!`);

    } catch (err) {
      console.error("Error updating verification status:", err);
      
      if (err.code === 'ACTION_REJECTED') {
        alert("Transaction was rejected by user");
      } else if (err.message?.includes('Doctor not registered')) {
        alert("Doctor is not registered in the system");
      } else if (err.message?.includes('Already verified')) {
        alert("Doctor is already verified");
      } else if (err.message?.includes('Not admin')) {
        alert("Only admin can verify doctors");
      } else if (err.message?.includes('insufficient funds')) {
        alert("Insufficient funds for gas");
      } else {
        alert(`Failed to verify doctor: ${err.message}`);
      }
    } finally {
      setUpdatingDoctor(null);
    }
  };

  // Show admin verification loading
  if (!isAdmin && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">System management and doctor verification</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Connected as Admin</p>
              <p className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {userAddress.substring(0, 8)}...{userAddress.substring(36)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <Activity className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.totalDoctors}</p>
              <p className="text-blue-100 text-sm">Total Doctors</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 opacity-80" />
                <UserCheck className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.verifiedDoctors}</p>
              <p className="text-green-100 text-sm">Verified Doctors</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <Activity className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.totalPatients}</p>
              <p className="text-purple-100 text-sm">Total Patients</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 opacity-80" />
                <Activity className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-3xl font-bold mb-1">{stats.totalRecords}</p>
              <p className="text-orange-100 text-sm">Total Records</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verify" className="w-full">
          <TabsList className="bg-white shadow-sm border mb-6">
            <TabsTrigger value="verify" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Verify Doctors
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              System Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verify">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Doctor Verification Management</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found in the system
                </p>
              </CardHeader>
              <CardContent>
                {doctors.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No doctors found in the system</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Doctors will appear here once they register
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                              doctor.verified 
                                ? 'bg-green-100' 
                                : 'bg-yellow-100'
                            }`}>
                              {doctor.verified ? (
                                <CheckCircle2 className="w-7 h-7 text-green-600" />
                              ) : (
                                <Clock className="w-7 h-7 text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                              <p className="text-sm text-gray-600">{doctor.specialization}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Degree: {doctor.degree} | Experience: {doctor.experience}
                              </p>
                              <p className="text-xs text-gray-500">Joined: {doctor.joinDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {doctor.verified ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            <Switch
                              checked={doctor.verified}
                              onCheckedChange={(checked) => {
                                if (checked && !doctor.verified) {
                                  handleVerificationToggle(doctor.id, true);
                                }
                              }}
                              disabled={doctor.verified || updatingDoctor === doctor.id}
                            />
                            {updatingDoctor === doctor.id && (
                              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                            <p className="font-mono text-sm text-gray-900">{doctor.walletAddress}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">License Number</p>
                            <p className="font-mono text-sm text-gray-900">{doctor.licenseNumber || "Not specified"}</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">IPFS Hash</p>
                            <p className="font-mono text-xs text-gray-900 break-all">{doctor.licenseHash}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Contact Info</p>
                            <p className="text-sm text-gray-900 break-all">{doctor.contactInfo || "Not specified"}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            View License
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            View Details
                          </Button>
                          {!doctor.verified && (
                            <Button
                              onClick={() => handleVerificationToggle(doctor.id, true)}
                              disabled={updatingDoctor === doctor.id}
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              {updatingDoctor === doctor.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                              )}
                              {updatingDoctor === doctor.id ? 'Verifying...' : 'Verify Now'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>System Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div>
                        <p className="text-sm text-blue-700 mb-1">Total System Users</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalDoctors + stats.totalPatients}</p>
                      </div>
                      <Users className="w-10 h-10 text-blue-600 opacity-60" />
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm text-green-700 mb-1">Verification Rate</p>
                        <p className="text-2xl font-bold text-green-900">
                          {stats.totalDoctors > 0 
                            ? Math.round((stats.verifiedDoctors / stats.totalDoctors) * 100)
                            : 0
                          }%
                        </p>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-green-600 opacity-60" />
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div>
                        <p className="text-sm text-purple-700 mb-1">Records per Patient</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {stats.totalPatients > 0 
                            ? (stats.totalRecords / stats.totalPatients).toFixed(1)
                            : 0
                          }
                        </p>
                      </div>
                      <FileText className="w-10 h-10 text-purple-600 opacity-60" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {doctors.slice(0, 3).map((doctor, index) => (
                      <div key={doctor.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">New Doctor Registration</p>
                          <p className="text-xs text-gray-600">Dr. {doctor.name} registered</p>
                          <p className="text-xs text-gray-400 mt-1">{doctor.joinDate}</p>
                        </div>
                        {doctor.verified && (
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
                        )}
                      </div>
                    ))}
                    
                    {doctors.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}