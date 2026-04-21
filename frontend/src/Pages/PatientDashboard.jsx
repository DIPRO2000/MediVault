import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { CONTRACTS } from "@/config/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Upload, FileText, Share2, Calendar, CheckCircle2, Clock, X, Camera, Loader2 } from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [patientDetails, setPatientDetails] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [recordType, setRecordType] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [doctorAddress, setDoctorAddress] = useState("");
  const [selectedFileHash, setSelectedFileHash] = useState("");
  const [grantingAccess, setGrantingAccess] = useState(false);
  
  // File access data states
  const [fileAccessData, setFileAccessData] = useState({});
  const [loadingAccessData, setLoadingAccessData] = useState(false);
  const [accessStats, setAccessStats] = useState(null);
  
  // Create refs for file inputs
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Pinata Gateway URL
  const PINATA_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";

  useEffect(() => {
    const verifyPatient = async () => {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask!");
          navigate("/");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        const contract = new ethers.Contract(
          CONTRACTS.patient.address,
          CONTRACTS.patient.abi,
          signer
        );

        const patient = await contract.patients(userAddress);
        setPatientDetails(patient);
        setUserAddress(userAddress);

        if (!patient.isRegistered) {
          alert("Access denied! Please register as a patient first.");
          navigate("/");
        }
      } catch (err) {
        console.error("Wallet verification failed:", err);
        alert("Could not verify your registration. Please reconnect your wallet.");
        navigate("/");
      }
    };

    verifyPatient();
  }, [navigate]);

  // Fetch patient files
  useEffect(() => {
    async function fetchPatientFiles() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/ipfs/getpatientfiles/${userAddress}`
        );
        const filesWithShared = response.data.fileRecords?.map(file => ({
          ...file,
          sharedWith: file.sharedWith || []
        })) || [];
        setUploadedFiles(filesWithShared);
      } catch (err) {
        console.error("Error fetching patient files:", err);
      }
    }

    if (userAddress) {
      fetchPatientFiles();
    }
  }, [userAddress, activeTab]);

  // Fetch file access data
  useEffect(() => {
    const fetchPatientFilesAccessData = async () => {
      if (!userAddress) return;
      
      setLoadingAccessData(true);
      try {
        console.log('Fetching patient files access data for:', userAddress);
        
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ipfs/files-access-stats/${userAddress}`);
        const data = await response.json();
        
        if (data.success) {
          console.log('Access data fetched successfully:', data);
          
          // Convert files array to object for easy lookup by fileHash
          const accessDataObj = {};
          data.files.forEach(file => {
            accessDataObj[file.fileHash] = file;
          });
          
          setFileAccessData(accessDataObj);
          setAccessStats(data.statistics);
          
          // Update uploadedFiles with sharedWith information from access data
          setUploadedFiles(prevFiles => 
            prevFiles.map(file => {
              const fileHash = file.fileHash || file.ipfsHash || file.fullHash;
              const accessInfo = accessDataObj[fileHash];
              
              if (accessInfo && !accessInfo.error) {
                return {
                  ...file,
                  sharedWith: accessInfo.doctorsWithAccess || [],
                  accessCount: accessInfo.accessCount || 0
                };
              }
              return file;
            })
          );
        } else {
          console.error('Failed to fetch access data:', data.error);
        }
      } catch (error) {
        console.error('Error fetching patient files access data:', error);
      } finally {
        setLoadingAccessData(false);
      }
    };

    if (userAddress && activeTab === "share") {
      fetchPatientFilesAccessData();
    }
  }, [userAddress, activeTab]);

  const patientInfo = {
    name: patientDetails ? patientDetails.name : "Loading...",
    gender: patientDetails ? patientDetails.gender : "Loading...",
    dob: patientDetails ? patientDetails.dateOfBirth : "Loading...",
    bloodGroup: patientDetails ? patientDetails.bloodGroup : "Loading...",
    contact: patientDetails ? patientDetails.contactInfo : "Loading...",
    Address: patientDetails ? patientDetails.homeAddress : "Loading...",
    walletAddress: `${userAddress ? userAddress : "Loading..."}`
  };

  // Handler for opening file dialog
  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  // Handler for opening camera
  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid file type (PDF, JPG, JPEG, PNG)");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert("File size too large. Please select a file smaller than 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = async (file) => {
    try {
      if (!recordType.trim()) {
        alert("Please enter the record type (e.g., X-Ray, Prescription).");
        return;
      }

      if (!file) {
        alert("Please select a file to upload.");
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // Upload to IPFS first
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ipfs/patientfileupload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`IPFS upload failed: ${errorText}`);
      }

      const data = await response.json();
      const ipfsHash = data.hash;

      if (!ipfsHash) {
        throw new Error("No IPFS hash returned from server");
      }

      console.log("IPFS Hash received:", ipfsHash);

      // Check if patient is registered first
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const patientContract = new ethers.Contract(
        CONTRACTS.patient.address,
        CONTRACTS.patient.abi,
        signer
      );

      const patientInfo = await patientContract.patients(userAddress);
      if (!patientInfo.isRegistered) {
        throw new Error("You need to register as a patient first before uploading files.");
      }

      // Check if file is already uploaded or not
      const fileHashes = await patientContract.getPatientFiles(userAddress); 
      const alreadyUploaded = fileHashes.includes(ipfsHash);
      if (alreadyUploaded) {
        throw new Error("This file has already been uploaded.");
      }

      // Push to blockchain
      try {
        const medicalRecordContract = new ethers.Contract(
          CONTRACTS.medicalrecord.address,
          CONTRACTS.medicalrecord.abi,
          signer
        );

        let gasLimit;
        try {
          gasLimit = await medicalRecordContract.uploadRecord.estimateGas(ipfsHash, recordType);
          console.log("Gas estimate:", gasLimit.toString());
        } catch (estimationError) {
          console.warn("Gas estimation failed, using default:", estimationError);
          gasLimit = 300000;
        }

        const tx = await medicalRecordContract.uploadRecord(
          ipfsHash, 
          recordType, 
          { gasLimit: gasLimit }
        );
        
        console.log("Transaction sent:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        const currentTimestamp = Math.floor(Date.now() / 1000);

        const newFile = {
          id: uploadedFiles.length + 1,
          name: `${recordType} - ${file.name}`,
          ipfsHash: `${ipfsHash.substring(0, 12)}...`,
          fullHash: ipfsHash,
          fileHash: ipfsHash,
          fileType: recordType,
          date: new Date().toISOString().split("T")[0],
          uploadTime: currentTimestamp.toString(),
          status: "verified",
          fileName: file.name,
          txHash: tx.hash,
          sharedWith: []
        };

        setUploadedFiles([newFile, ...uploadedFiles]);
        
        alert(`✅ File "${file.name}" uploaded successfully!\nTransaction: ${tx.hash}`);
        
      } catch (blockchainError) {
        console.error("Blockchain error details:", blockchainError);
        
        if (blockchainError.code === 'INVALID_ARGUMENT') {
          throw new Error("Invalid parameters sent to contract. Please check your inputs.");
        } else if (blockchainError.code === 'CALL_EXCEPTION') {
          throw new Error("Contract call failed. Make sure you're connected to the right network and have the correct contract address.");
        } else if (blockchainError.code === 'INSUFFICIENT_FUNDS') {
          throw new Error("Insufficient funds for gas. Please add ETH to your wallet.");
        } else if (blockchainError.message?.includes('user rejected')) {
          throw new Error("Transaction was rejected by user.");
        } else if (blockchainError.message?.includes('Patient not registered')) {
          throw new Error("You need to register as a patient first.");
        } else {
          throw new Error(`Blockchain transaction failed: ${blockchainError.message}`);
        }
      }

      setRecordType("");
      setSelectedFile(null);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';

    } catch (err) {
      console.error("Upload error:", err);
      alert(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleGrantAccess = async () => {
    if (!doctorAddress || !selectedFileHash) {
      alert("Please select a file and enter doctor's address");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(doctorAddress)) {
      alert("Please enter a valid Ethereum wallet address");
      return;
    }

    console.log("Granting access to", doctorAddress, "for file", selectedFileHash);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const AccessControlContract = new ethers.Contract(
        CONTRACTS.accesscontrol.address,
        CONTRACTS.accesscontrol.abi,
        signer
      );

      const DoctorContract = new ethers.Contract(
        CONTRACTS.doctor.address,
        CONTRACTS.doctor.abi,
        signer
      );

      let isRegisteredDoctor = false;
      try {
        const doctorData = await DoctorContract.doctors(doctorAddress);
        isRegisteredDoctor = doctorData.registered;
        console.log("Doctor registration status:", isRegisteredDoctor);
      } catch (error) {
        console.error("Error checking doctor registration:", error);
      }

      if (!isRegisteredDoctor) {
        alert("The specified address is not a registered doctor in the system.");
        return;
      }

      try {
        const hasAccess = await AccessControlContract.hasAccess(selectedFileHash, doctorAddress);
        if (hasAccess) {
          alert("This doctor already has access to the selected file.");
          return;
        }
      } catch (error) {
        console.warn("Could not check existing access, proceeding anyway:", error);
      }

      console.log("Sending grantAccess transaction...");
      const tx = await AccessControlContract.grantAccess(selectedFileHash, doctorAddress);
      
      console.log("Grant access transaction sent:", tx.hash);
      
      setGrantingAccess(true);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Update uploadedFiles with the new access
      setUploadedFiles(prevFiles => 
        prevFiles.map(file => {
          const fileHash = file.fileHash || file.ipfsHash || file.fullHash;
          if (fileHash === selectedFileHash) {
            return {
              ...file,
              sharedWith: [...(file.sharedWith || []), doctorAddress]
            };
          }
          return file;
        })
      );

      // Update fileAccessData
      setFileAccessData(prev => ({
        ...prev,
        [selectedFileHash]: {
          ...prev[selectedFileHash],
          doctorsWithAccess: [...(prev[selectedFileHash]?.doctorsWithAccess || []), doctorAddress],
          accessCount: (prev[selectedFileHash]?.accessCount || 0) + 1
        }
      }));

      alert(`✅ Access granted to doctor: ${doctorAddress}`);
      setDoctorAddress("");
      setSelectedFileHash("");
      
    } catch (err) {
      console.error("Error granting access:", err);
      
      if (err.code === 'ACTION_REJECTED') {
        alert("❌ Transaction was rejected by user");
      } else if (err.message?.includes('Patient not registered')) {
        alert("❌ You need to be registered as a patient to grant access");
      } else if (err.message?.includes('Doctor not registered')) {
        alert("❌ The specified doctor is not registered in the system");
      } else if (err.message?.includes('Access already granted')) {
        alert("❌ Access has already been granted to this doctor");
      } else if (err.message?.includes('Invalid file hash')) {
        alert("❌ Invalid file selected");
      } else {
        alert(`❌ Failed to grant access: ${err.message}`);
      }
    } finally {
      setGrantingAccess(false);
    }
  };

  const handleRevokeAccess = async (fileHash, doctorAddress) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const AccessControlContract = new ethers.Contract(
        CONTRACTS.accesscontrol.address,
        CONTRACTS.accesscontrol.abi,
        signer
      );

      //console.log("Filehash to revoke:", fileHash);

      const tx = await AccessControlContract.revokeAccess(fileHash, doctorAddress);
      await tx.wait();

      // Update uploadedFiles
      setUploadedFiles(prevFiles => 
        prevFiles.map(file => {
          const currentFileHash = file.fileHash || file.ipfsHash || file.fullHash;
          if (currentFileHash === fileHash) {
            return {
              ...file,
              sharedWith: file.sharedWith?.filter(addr => addr !== doctorAddress) || []
            };
          }
          return file;
        })
      );

      // Update fileAccessData
      setFileAccessData(prev => ({
        ...prev,
        [fileHash]: {
          ...prev[fileHash],
          doctorsWithAccess: prev[fileHash]?.doctorsWithAccess?.filter(addr => addr !== doctorAddress) || [],
          accessCount: Math.max(0, (prev[fileHash]?.accessCount || 0) - 1)
        }
      }));

      alert(`✅ Access revoked for doctor: ${doctorAddress}`);
      
    } catch (err) {
      console.error("Error revoking access:", err);
      alert(`❌ Failed to revoke access: ${err.message}`);
    }
  };

  const handleViewFile = (file) => {
    const ipfsHash = file.fileHash || file.ipfsHash;

    if (!ipfsHash) {
      console.error("Error: Cannot view file. IPFS hash is missing.");
      return;
    }

    const ipfsUrl = `${PINATA_GATEWAY_URL}${ipfsHash}`;
    window.open(ipfsUrl, '_blank');
    console.log(`Successfully opened file: ${file.fileType} (Hash: ${ipfsHash}) in a new tab.`);
  };

  // Helper function to get access data for a file
  const getFileAccessData = (fileHash) => {
    return fileAccessData[fileHash] || {
      doctorsWithAccess: [],
      accessCount: 0,
      error: null
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
          <p className="text-gray-600">Manage your medical records securely</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Patient Profile */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-lg sticky top-8">
              <CardHeader className="border-b bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Patient Profile</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{patientInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Gender</p>
                    <p className="font-semibold text-gray-900">{patientInfo.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                    <p className="font-semibold text-gray-900">{patientInfo.dob}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Blood Group</p>
                    <p className="font-semibold text-gray-900">{patientInfo.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Contact</p>
                    <p className="font-semibold text-gray-900">{patientInfo.contact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="font-semibold text-gray-900">{patientInfo.Address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
                    <p className="font-mono text-xs text-gray-900 break-all bg-gray-100 p-2 rounded">
                      {patientInfo.walletAddress}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white shadow-sm border mb-6">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Records
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  My Files
                </TabsTrigger>
                <TabsTrigger value="share" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Access
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={patientInfo.name} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Input value={patientInfo.gender} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" value={patientInfo.dob} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Blood Group</Label>
                        <Input value={patientInfo.bloodGroup} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Number</Label>
                        <Input value={patientInfo.contact} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input value={patientInfo.Address} readOnly />
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Your profile information is stored on the blockchain and cannot be modified directly. 
                        Contact support if you need to update your information.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Upload Medical Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Record Type Input */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <Label htmlFor="record-type" className="mb-2 sm:mb-0 sm:w-32">
                        Type of Record
                      </Label>
                      <Input
                        id="record-type"
                        placeholder="e.g., X-Ray, Blood Test, Prescription"
                        value={recordType}
                        onChange={(e) => setRecordType(e.target.value)}
                        className="flex-1"
                        disabled={uploading}
                      />
                    </div>

                    {/* Selected File Preview */}
                    {selectedFile && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                              <p className="text-sm text-gray-600">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeSelectedFile}
                            disabled={uploading}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Upload Section */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center hover:border-blue-400 transition-colors">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Upload Your Medical Documents
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Files will be encrypted and stored on IPFS with blockchain verification
                      </p>

                      {/* Upload options */}
                      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                          onClick={handleChooseFileClick}
                          disabled={uploading}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>

                        <Button
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                          onClick={handleCameraClick}
                          disabled={uploading}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Capture from Camera
                        </Button>

                        {selectedFile && (
                          <Button
                            onClick={() => handleFileUpload(selectedFile)}
                            disabled={uploading || !recordType.trim()}
                            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                          >
                            {uploading ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Now
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Hidden file inputs */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      />
                      <input
                        type="file"
                        ref={cameraInputRef}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      />

                      {uploading && (
                        <div className="mt-4">
                          <p className="text-blue-600">Uploading to IPFS and blockchain...</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-gray-500 mt-4">
                        Supported formats: PDF, JPG, JPEG, PNG (Max 10MB)
                      </p>
                    </div>

                    {/* Upload Info Section */}
                    <div className="mt-6 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">How Upload Works:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Your file is encrypted end-to-end before upload</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Document is stored on IPFS distributed network</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>IPFS hash is recorded on blockchain for verification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Only you control who can access your files</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>My Medical Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {uploadedFiles.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No medical records uploaded yet.</p>
                        <Button 
                          className="mt-4" 
                          onClick={() => setActiveTab("upload")}
                        >
                          Upload Your First Record
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{file.fileType}</h4>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(Number(file.uploadTime) * 1000).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400 font-mono mt-1">
                                  IPFS HASH: {file.fileHash}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewFile(file)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="share">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Share Access with Doctors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* File Selection */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file-select">Select File to Share</Label>
                        <select
                          id="file-select"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          onChange={(e) => setSelectedFileHash(e.target.value)}
                          value={selectedFileHash}
                        >
                          <option value="">Choose a file...</option>
                          {uploadedFiles.map((file) => (
                            <option key={file.fileHash} value={file.fileHash}>
                              {file.fileType} - {file.fileHash}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="doctor-address">Doctor's Wallet Address</Label>
                        <Input
                          id="doctor-address"
                          placeholder="0x..."
                          value={doctorAddress}
                          onChange={(e) => setDoctorAddress(e.target.value)}
                        />
                      </div>

                      <Button
                        onClick={handleGrantAccess}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={!doctorAddress || !selectedFileHash || grantingAccess}
                      >
                        {grantingAccess ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Granting Access...
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 mr-2" />
                            Grant Access
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Access Statistics */}
                    {accessStats && (
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Access Statistics</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total Files:</span>
                            <span className="font-semibold ml-2">{accessStats.totalFiles}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Files with Access:</span>
                            <span className="font-semibold ml-2">{accessStats.filesWithAccess}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Grants:</span>
                            <span className="font-semibold ml-2">{accessStats.totalAccessGrants}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Avg per File:</span>
                            <span className="font-semibold ml-2">{accessStats.averageAccessPerFile}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Currently Shared Access */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Access Management</h4>
                        {loadingAccessData && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                      </div>
                      {uploadedFiles.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No files available to manage access.</p>
                      ) : (
                        <div className="space-y-4">
                          {uploadedFiles.map((file) => {
                            const fileHash = file.fileHash;
                            const accessData = getFileAccessData(fileHash);
                            
                            return (
                              <div key={fileHash} className="p-4 bg-white border rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <p className="font-medium text-gray-900">{file.fileType}</p>
                                    <p className="text-sm text-gray-500 font-mono">
                                      {fileHash ? `${fileHash.substring(0, 16)}...` : 'No hash available'}
                                    </p>
                                    {accessData && (
                                      <p className="text-xs text-blue-600 mt-1">
                                        Shared with {accessData.accessCount} doctor{accessData.accessCount !== 1 ? 's' : ''}
                                      </p>
                                    )}
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedFileHash(fileHash)}
                                  >
                                    Select
                                  </Button>
                                </div>
                                
                                {/* Shared Doctors List for this file */}
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Shared with:</p>
                                  {loadingAccessData ? (
                                    <p className="text-sm text-gray-500">Loading access data...</p>
                                  ) : accessData && accessData.doctorsWithAccess && accessData.doctorsWithAccess.length > 0 ? (
                                    <div className="space-y-2">
                                      {accessData.doctorsWithAccess.map((doctor, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                          <span className="font-mono text-gray-600">
                                            {`${doctor.substring(0, 8)}...${doctor.substring(36)}`}
                                          </span>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleRevokeAccess(fileHash, doctor)}
                                          >
                                            Revoke
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">Not shared with any doctors</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}