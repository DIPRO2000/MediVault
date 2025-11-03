import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, CheckCircle2, Clock, FileText, User, Shield } from "lucide-react";

export default function DoctorDashboard() {
  const doctorInfo = {
    name: "Dr. Sarah Johnson",
    specialization: "Cardiology",
    licenseHash: "QmY83hLp9KjT3Rt5mQ...",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    verificationStatus: "verified"
  };

  const patientRecords = [
    {
      id: 1,
      patientName: "John Doe",
      patientAddress: "0x8f3b21Aa...3c7dEf",
      recordName: "Blood Test Report",
      ipfsHash: "QmX47fKj...",
      date: "2025-01-15",
      type: "Lab Report"
    },
    {
      id: 2,
      patientName: "Jane Smith",
      patientAddress: "0x9a2c45Bb...4d8eGh",
      recordName: "MRI Scan Results",
      ipfsHash: "QmY83hLp...",
      date: "2025-01-12",
      type: "Imaging"
    },
    {
      id: 3,
      patientName: "Robert Brown",
      patientAddress: "0x1b3d56Cc...5e9fIj",
      recordName: "Cardiac Stress Test",
      ipfsHash: "QmZ92kQw...",
      date: "2025-01-10",
      type: "Diagnostic"
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Access and manage patient medical records</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-lg sticky top-8">
              <CardHeader className="border-b bg-linear-to-br from-green-500 to-green-600 text-white rounded-t-lg">
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
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    {doctorInfo.verificationStatus === "verified" ? (
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
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">License Hash</p>
                    <p className="font-mono text-xs text-gray-900 break-all bg-gray-100 p-2 rounded">
                      {doctorInfo.licenseHash}
                    </p>
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

          {/* Main Content */}
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
                      <div className="p-6 bg-linear-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                        <p className="text-sm text-green-700 mb-2">Total Patients</p>
                        <p className="text-3xl font-bold text-green-900">24</p>
                      </div>
                      <div className="p-6 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-700 mb-2">Records Accessed</p>
                        <p className="text-3xl font-bold text-blue-900">156</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                        <p className="text-gray-600 text-sm">
                          Board-certified cardiologist with over 15 years of experience in cardiovascular medicine. 
                          Specializing in preventive cardiology, heart failure management, and cardiac imaging.
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Credentials</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            MD, Harvard Medical School
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Board Certified in Cardiology
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            License Verified on Blockchain
                          </li>
                        </ul>
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
                      {doctorInfo.verificationStatus === "verified" ? (
                        <div className="p-6 bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-xl">
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
                      ) : (
                        <div className="p-6 bg-linear-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                              <Clock className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-yellow-900">Verification Pending</h3>
                              <p className="text-sm text-yellow-700">Your application is under review</p>
                            </div>
                          </div>
                          <p className="text-sm text-yellow-800">
                            An administrator will review your credentials shortly. You'll be notified once verification is complete.
                          </p>
                        </div>
                      )}

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
                    <CardTitle>Patient Records (Accessed)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {patientRecords.map((record) => (
                        <div
                          key={record.id}
                          className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{record.recordName}</h4>
                                <p className="text-sm text-gray-600">Patient: {record.patientName}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {record.type}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                              <p className="text-gray-500">Date</p>
                              <p className="font-medium text-gray-900">{record.date}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Patient Address</p>
                              <p className="font-mono text-xs text-gray-900">{record.patientAddress}</p>
                            </div>
                          </div>
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">IPFS Hash</p>
                            <p className="font-mono text-xs bg-gray-100 p-2 rounded text-gray-700">
                              {record.ipfsHash}
                            </p>
                          </div>
                          <Button variant="outline" className="w-full">
                            View Record
                          </Button>
                        </div>
                      ))}
                    </div>

                    {patientRecords.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No patient records available yet</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Patients will share their records with you once you're verified
                        </p>
                      </div>
                    )}
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