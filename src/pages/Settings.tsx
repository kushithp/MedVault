import * as React from "react";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Eye, 
  Cloud, 
  Globe,
  LogOut
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <header className="glass-header h-16 flex items-center justify-between px-6 lg:px-8 shrink-0">
        <h1 className="text-xl font-bold text-[#1E293B]">System Settings</h1>
      </header>

      <main className="scroll-container custom-scrollbar px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-slate-500">Manage your profile, security, and notification preferences.</p>
        </div>

      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and how others see you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input defaultValue="john@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input type="date" defaultValue="1990-01-01" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Blood Group</label>
                <Input defaultValue="O+" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
            <CardDescription>Protect your medical data with advanced security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Two-Factor Authentication</span>
                </div>
                <p className="text-xs text-slate-500">Add an extra layer of security to your health vault.</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">File Encryption</span>
                </div>
                <p className="text-xs text-slate-500">All uploaded medical reports are encrypted end-to-end.</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/10">
          <CardHeader>
            <CardTitle className="text-rose-900">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-slate-600 font-medium">Delete account and all medical records permanently.</p>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
      </main>
    </div>
  );
}

// Dummy badge and switch since I didn't add them via shadcn CLI correctly perhaps or just for safety
import { Badge } from "@/components/ui/badge";
const Switch = () => <div className="h-6 w-11 bg-slate-200 rounded-full cursor-pointer relative"><div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" /></div>;
