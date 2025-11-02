import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Upload, FileText, Share2, Calendar, CheckCircle2, Clock } from "lucide-react";

export default function PatientDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: "Blood Test Report - Jan 2025", ipfsHash: "QmX47fKj...", date: "2025-01-15", status: "verified" },
    { id: 2, name: "MRI Scan Results", ipfsHash: "QmY83hLp...", date: "2025-01-10", status: "verified" },
    { id: 3, name: "Prescription - Dr. Smith", ipfsHash: "QmZ92kQw...", date: "2025-01-05", status: "pending" }
  ]);

  const [doctorAddress, setDoctorAddress] = useState("");
  
  const patientInfo = {
    name: "John Doe",
    gender: "Male",
    dob: "1990-05-15",
    contact: "+1 (555) 123-4567",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockHash = `Qm${Math.random().toString(36).substring(7)}...`;
      const newFile = {
        id: uploadedFiles.length + 1,
        name: file.name,
        ipfsHash: mockHash,
        date: new Date().toISOString().split('T')[0],
        status: "pending"
      };
      setUploadedFiles([newFile, ...uploadedFiles]);
      alert(`File uploaded successfully! IPFS Hash: ${mockHash}`);
    }
  };

  const handleGrantAccess = () => {
    if (doctorAddress) {
      alert(`Access granted to doctor: ${doctorAddress}`);
      setDoctorAddress("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
          <p className="text-gray-600">Manage your medical records securely</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
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
                    <p className="text-sm text-gray-500 mb-1">Contact</p>
                    <p className="font-semibold text-gray-900">{patientInfo.contact}</p>
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

          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
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
                        <Label>Contact Number</Label>
                        <Input value={patientInfo.contact} readOnly />
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
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Upload Your Medical Documents
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Files will be encrypted and stored on IPFS with blockchain verification
                      </p>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Choose File
                      </Button>
                      <p className="text-sm text-gray-500 mt-4">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>

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
                              <h4 className="font-semibold text-gray-900">{file.name}</h4>
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {file.date}
                              </p>
                              <p className="text-xs text-gray-400 font-mono mt-1">
                                IPFS: {file.ipfsHash}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {file.status === "verified" ? (
                              <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                <CheckCircle2 className="w-4 h-4" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                                <Clock className="w-4 h-4" />
                                Pending
                              </span>
                            )}
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="share">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Share Access with Doctors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
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
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Grant Access
                      </Button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Currently Shared With:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Dr. Sarah Johnson</p>
                            <p className="text-sm text-gray-500 font-mono">0x742d35Cc...5f0bEb</p>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Revoke
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Dr. Michael Chen</p>
                            <p className="text-sm text-gray-500 font-mono">0x8f3b21Aa...3c7dEf</p>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Revoke
                          </Button>
                        </div>
                      </div>
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