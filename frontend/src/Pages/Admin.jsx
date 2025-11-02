import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, UserCheck, Activity, FileText, Users, CheckCircle2, Clock } from "lucide-react";

export default function Admin() {
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: "Cardiology",
      licenseHash: "QmY83hLp9KjT3Rt5mQ...",
      walletAddress: "0x742d35Cc...5f0bEb",
      verified: true,
      joinDate: "2025-01-10"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Neurology",
      licenseHash: "QmX47fKj8Lp2Nv6sR...",
      walletAddress: "0x8f3b21Aa...3c7dEf",
      verified: false,
      joinDate: "2025-01-15"
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialization: "Pediatrics",
      licenseHash: "QmZ92kQw5Mp9Tn7uP...",
      walletAddress: "0x9a2c45Bb...4d8eGh",
      verified: true,
      joinDate: "2025-01-08"
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialization: "Orthopedics",
      licenseHash: "QmA15nRx6Oq4Vs8wT...",
      walletAddress: "0x1b3d56Cc...5e9fIj",
      verified: false,
      joinDate: "2025-01-18"
    }
  ]);

  const stats = {
    totalDoctors: doctors.length,
    verifiedDoctors: doctors.filter(d => d.verified).length,
    totalPatients: 48,
    totalRecords: 324
  };

  const handleVerificationToggle = (doctorId) => {
    setDoctors(doctors.map(doc => {
      if (doc.id === doctorId) {
        const newStatus = !doc.verified;
        alert(`Dr. ${doc.name} ${newStatus ? 'verified' : 'unverified'} successfully`);
        return { ...doc, verified: newStatus };
      }
      return doc;
    }));
  };

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
              </CardHeader>
              <CardContent>
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
                            <p className="text-xs text-gray-500 mt-1">Joined: {doctor.joinDate}</p>
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
                          <p className="text-xs text-gray-500 mb-1">License Hash</p>
                          <p className="font-mono text-sm text-gray-900">{doctor.licenseHash}</p>
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
                          {Math.round((stats.verifiedDoctors / stats.totalDoctors) * 100)}%
                        </p>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-green-600 opacity-60" />
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div>
                        <p className="text-sm text-purple-700 mb-1">Records per Patient</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {(stats.totalRecords / stats.totalPatients).toFixed(1)}
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
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Doctor Verified</p>
                        <p className="text-xs text-gray-600">Dr. Sarah Johnson was verified</p>
                        <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">New Doctor Registration</p>
                        <p className="text-xs text-gray-600">Dr. James Wilson registered</p>
                        <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-1">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Record Uploaded</p>
                        <p className="text-xs text-gray-600">New patient record added to system</p>
                        <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                      </div>
                    </div>
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