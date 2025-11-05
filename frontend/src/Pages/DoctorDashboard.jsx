import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, CheckCircle2, Clock, FileText, User, Shield, Loader2, AlertCircle, Calendar } from "lucide-react";
import { CONTRACTS } from "@/config/contracts.js";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({
    name: "Loading...",
    specialization: "Loading...",
    licenseHash: "Loading...",
    walletAddress: "Loading...",
    verificationStatus: "pending"
  });

  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState(null);

  // Pinata Gateway URL
  const PINATA_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";

  // Verify doctor and fetch data
  useEffect(() => {
    const verifyAndFetchDoctor = async () => {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask!");
          navigate("/");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        const doctorContract = new ethers.Contract(
          CONTRACTS.doctor.address,
          CONTRACTS.doctor.abi,
          signer
        );

        // Check if doctor is registered
        const doctorData = await doctorContract.doctors(userAddress);

        console.log("Doctor Data from Contract:", doctorData);
        
        if (!doctorData.registered) {
          alert("Access denied! Please register as a doctor first.");
          navigate("/");
          return;
        }

        // Set verification status
        setIsVerified(doctorData.verified);
        console.log("Doctor verification status:", doctorData.verified);

        // Get IPFS hash from contract and fetch doctor data
        const ipfsHash = doctorData.ipfsHash;
        await fetchDoctorDataFromAPI(userAddress, ipfsHash);

        // If verified, fetch accessible patient records
        if (doctorData.verified) {
          await fetchAccessiblePatientRecords(userAddress);
        }

      } catch (err) {
        console.error("Doctor verification failed:", err);
        setError("Could not verify your doctor registration. Please reconnect your wallet.");
        alert("Could not verify your doctor registration. Please reconnect your wallet.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchDoctor();
  }, [navigate]);

  // Fetch doctor data from backend API
  const fetchDoctorDataFromAPI = async (doctorAddress, ipfsHash) => {
    try {
      console.log("Fetching doctor data from API for:", doctorAddress);
      
      const response = await fetch(
        `http://localhost:3000/api/doctor/doctordetails/${doctorAddress}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch doctor data from API");
      }

      console.log("Doctor data fetched successfully from API:", data);
      
      // Update doctor info with data from API
      setDoctorInfo({
        name: data.metadata.name || "Dr. Unknown",
        specialization: data.metadata.specialization || "General Medicine",
        licenseHash: ipfsHash ? `${ipfsHash.substring(0, 20)}...` : "Not available",
        walletAddress: doctorAddress,
        verificationStatus: isVerified ? "verified" : "pending",
        // Include additional metadata
        degree: data.metadata.degree,
        licenseNumber: data.metadata.licenseNumber,
        experience: data.metadata.experience,
        contactInfo: data.metadata.contactInfo,
        timestamp: data.metadata.timestamp
      });

    } catch (err) {
      console.error("Error fetching doctor data from API:", err);
      setError(err.message);
      
      // Fallback: Set basic info from wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const formattedAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
      
      setDoctorInfo({
        name: "Dr. Registered Doctor",
        specialization: "General Medicine",
        licenseHash: "Not available",
        walletAddress: formattedAddress,
        verificationStatus: isVerified ? "verified" : "pending"
      });
    }
  };

  // Fetch accessible patient records
  const fetchAccessiblePatientRecords = async (doctorAddress) => {
    if (!doctorAddress) return;
    
    setLoadingRecords(true);
    try {
      console.log('Fetching accessible patient records for doctor:', doctorAddress);
      
      const response = await fetch(`http://localhost:3000/api/doctor/accessible-files-with-patient-info/${doctorAddress}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Accessible files fetched successfully:', data);
        setPatientRecords(data.accessibleFiles || []);
      } else {
        console.error('Failed to fetch accessible files:', data.error);
        setPatientRecords([]);
      }
    } catch (error) {
      console.error('Error fetching accessible patient records:', error);
      setPatientRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Handle viewing a patient record
  const handleViewRecord = (record) => {
    if (!record.fileHash) {
      console.error("Error: Cannot view record. File hash is missing.");
      return;
    }

    const ipfsUrl = `${PINATA_GATEWAY_URL}${record.fileHash}`;
    window.open(ipfsUrl, '_blank');
    console.log(`Successfully opened record: ${record.recordType} (Hash: ${record.fileHash}) in a new tab.`);
  };

  // Format date for display
  const formatDate = (timestamp) => {
    try {
      const date = new Date(Number(timestamp) * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  // Show loading spinner while verifying
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying doctor credentials...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not registered
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  // Component for when doctor is not verified
  const NotVerifiedView = () => (
    <div className="lg:col-span-3">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Doctor Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Pending</h3>
            <p className="text-gray-600 mb-6">
              Your doctor registration is pending verification. You will gain access to patient records once your credentials are verified.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Patient record access is restricted to verified doctors only for security reasons.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">
            {isVerified 
              ? "Access and manage patient medical records" 
              : "Your verification is pending"
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Always show profile */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-lg sticky top-8">
              <CardHeader className="border-b bg-gradient-to-br from-green-500 to-green-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Doctor Profile</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{doctorInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Specialization</p>
                    <p className="font-semibold text-gray-900">{doctorInfo.specialization}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Degree</p>
                    <p className="font-semibold text-gray-900">{doctorInfo.degree || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Experience</p>
                    <p className="font-semibold text-gray-900">
                      {doctorInfo.experience ? `${doctorInfo.experience} years` : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    {isVerified ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">License Number</p>
                    <p className="font-semibold text-gray-900">{doctorInfo.licenseNumber || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Contact Info</p>
                    <p className="text-sm text-gray-900 break-all">{doctorInfo.contactInfo || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
                    <p className="font-mono text-xs text-gray-900 break-all bg-gray-100 p-2 rounded">
                      {doctorInfo.walletAddress}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Show different views based on verification status */}
          {isVerified ? (
            <div className="lg:col-span-3">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-white shadow-sm border mb-6">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Verification
                  </TabsTrigger>
                  <TabsTrigger value="records" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Patient Records
                  </TabsTrigger>
                </TabsList>

                
                <TabsContent value="profile">
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle>Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                          <p className="text-sm text-green-700 mb-2">Total Patients</p>
                          <p className="text-3xl font-bold text-green-900">
                            {[...new Set(patientRecords.map(record => record.patient?.walletAddress))].length}
                          </p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                          <p className="text-sm text-blue-700 mb-2">Records Accessed</p>
                          <p className="text-3xl font-bold text-blue-900">{patientRecords.length}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                          <p className="text-gray-600 text-sm">
                            {doctorInfo.name} is a {doctorInfo.specialization.toLowerCase()} specialist with {doctorInfo.experience || "several"} years of experience. 
                            {doctorInfo.degree && ` Holding a ${doctorInfo.degree} degree,`} Dr. {doctorInfo.name.split(' ').pop()} provides expert medical care with verified credentials on the blockchain.
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Professional Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span>Specialization: {doctorInfo.specialization}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span>Degree: {doctorInfo.degree || "Not specified"}</span>
                            </div>
                            {doctorInfo.licenseNumber && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span>License: {doctorInfo.licenseNumber}</span>
                              </div>
                            )}
                            {doctorInfo.experience && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span>Experience: {doctorInfo.experience} years</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="verification">
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle>Verification Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-green-900">Verified Doctor</h3>
                              <p className="text-sm text-green-700">Your credentials have been verified</p>
                            </div>
                          </div>
                          <p className="text-sm text-green-800">
                            You have full access to patient records that have been shared with you. 
                            Your license and credentials are verified on the blockchain.
                          </p>
                        </div>

                        <div className="border rounded-xl overflow-hidden">
                          <div className="bg-gray-50 p-4 border-b">
                            <h4 className="font-semibold text-gray-900">Verification Details</h4>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Identity Verification</span>
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Medical License</span>
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Blockchain Record</span>
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Registered
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="records">
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Patient Records</CardTitle>
                        <div className="flex items-center gap-2">
                          {loadingRecords && (
                            <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                          )}
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {patientRecords.length} Records
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingRecords ? (
                        <div className="text-center py-12">
                          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
                          <p className="text-gray-600">Loading patient records...</p>
                        </div>
                      ) : patientRecords.length > 0 ? (
                        <div className="space-y-4">
                          {patientRecords.map((record, index) => (
                            <div
                              key={index}
                              className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{record.recordType}</h4>
                                    <p className="text-sm text-gray-600">
                                      Patient: {record.patient?.name || "Unknown Patient"}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {record.recordType}
                                </Badge>
                              </div>
                              
                              {/* Patient Information */}
                              <div className="grid md:grid-cols-2 gap-4 mb-3">
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500">Patient Name</p>
                                    <p className="font-medium text-gray-900">{record.patient?.name || "Unknown"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Blood Group</p>
                                    <p className="font-medium text-gray-900">{record.patient?.bloodGroup || "Not specified"}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500">Contact</p>
                                    <p className="font-medium text-gray-900">{record.patient?.contactInfo || "Not specified"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Patient Wallet Address</p>
                                    <p className="font-mono text-xs text-gray-900">
                                      {record.patient?.walletAddress ? 
                                        `${record.patient.walletAddress.substring(0, 8)}...${record.patient.walletAddress.substring(36)}` 
                                        : "Unknown"
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Record Information */}
                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-500">Upload Date</p>
                                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(record.timestamp)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Access Granted By</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {record.accessGrantedBy === record.patient?.walletAddress ? 
                                      "Patient" : "Unknown"
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-1">IPFS Hash</p>
                                <p className="font-mono text-xs bg-gray-100 p-2 rounded text-gray-700 break-all">
                                  {record.fileHash}
                                </p>
                              </div>
                              
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => handleViewRecord(record)}
                              >
                                View Record
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No patient records available yet</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Patients will share their records with you once you're verified
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => fetchAccessiblePatientRecords(doctorInfo.walletAddress)}
                          >
                            Refresh Records
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <NotVerifiedView />
          )}
        </div>
      </div>
    </div>
  );
}