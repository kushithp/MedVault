import * as React from "react";
import { 
  LayoutDashboard, 
  FileText, 
  UploadCloud,
  Settings, 
  Activity, 
  Calendar,
  ShieldCheck,
  Stethoscope,
  Users,
  Pill
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: UploadCloud, label: "Deep Scan AI", path: "/upload" },
  { icon: FileText, label: "Health Vault", path: "/records" },
  { icon: Stethoscope, label: "AI Analysis", path: "/summaries" },
  { icon: Pill, label: "Medicines", path: "/medicines" },
  { icon: Activity, label: "Health Tracker", path: "/tracker" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: Users, label: "Family Profiles", path: "/family" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const userInitials = user?.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="flex h-screen w-64 flex-col border-r border-[#E2E8F0] bg-white">
      <div className="flex h-16 items-center px-6 border-b border-[#E2E8F0]">
        <div className="h-8 w-8 bg-[#2563EB] rounded-lg flex items-center justify-center mr-3 text-white font-bold">
          M
        </div>
        <span className="text-xl font-bold tracking-tight text-[#1E293B]">MedVault AI</span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <motion.div
              whileHover={{ x: 2 }}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]"
              )}
            >
              <item.icon className={cn("h-5 w-5", location.pathname === item.path ? "text-[#2563EB]" : "text-[#64748B]")} />
              <span>{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-[#E2E8F0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 px-3 py-2 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
              {userInitials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.displayName || "System User"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { LogOut } from "lucide-react";
import { useAuthStore } from "@/src/store/authStore";
