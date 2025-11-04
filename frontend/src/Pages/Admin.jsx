import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, UserCheck, Activity, FileText, Users, CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";
import { CONTRACTS } from "@/config/contracts";

export default function Admin() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    verifiedDoctors: 0,
    totalPatients: 0,
    totalRecords: 0
  });

  // Fetch all doctors data
  useEffect(() => {
    const fetchAllData = async () => {
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
          verified: doctor.verified, // You'll need to get this from your contract
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
  }, []);

  const handleVerificationToggle = async (doctorId) => {
    try {
      const doctor = doctors.find(d => d.id === doctorId);
      if (!doctor) return;

      const newStatus = !doctor.verified;
      
      // Here you would typically call your backend API to update verification status
      // For now, we'll just update the local state
      setDoctors(doctors.map(doc => {
        if (doc.id === doctorId) {
          const updatedDoctor = { ...doc, verified: newStatus };
          
          // Update stats
          setStats(prevStats => ({
            ...prevStats,
            verifiedDoctors: newStatus 
              ? prevStats.verifiedDoctors + 1 
              : prevStats.verifiedDoctors - 1
          }));

          alert(`Dr. ${doc.name} ${newStatus ? 'verified' : 'unverified'} successfully`);
          return updatedDoctor;
        }
        return doc;
      }));

      // TODO: Call your backend API to update verification status on blockchain
      // await fetch(`/api/doctor/verify/${doctor.fullAddress}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ verified: newStatus })
      // });

    } catch (err) {
      console.error("Error updating verification status:", err);
      alert("Failed to update verification status");
    }
  };

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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">System management and doctor verification</p>
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
                              onCheckedChange={() => handleVerificationToggle(doctor.id)}
                            />
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
                              onClick={() => handleVerificationToggle(doctor.id)}
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Verify Now
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