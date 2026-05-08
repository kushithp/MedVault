import * as React from "react";
import { 
  Users, 
  Plus, 
  Baby, 
  User, 
  Heart, 
  MoreHorizontal,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { motion } from "motion/react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const familyMembers = [
  { name: "Emily Doe", role: "Spouse", age: 34, bloodGroup: "O+", records: 15, avatar: "ED" },
  { name: "Oliver Doe", role: "Son", age: 8, bloodGroup: "A+", records: 8, avatar: "OD" },
  { name: "Sarah Smith", role: "Mother", age: 62, bloodGroup: "B+", records: 24, avatar: "SS" },
];

export default function Family() {
  return (
    <div className="p-8 space-y-8 bg-slate-50/30 h-full overflow-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Health Vault</h1>
          <p className="text-slate-500">Manage health records for your entire family in one place.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Family Member
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {familyMembers.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                <Avatar className="h-12 w-12 border-2 border-blue-50 ring-2 ring-white">
                  <AvatarFallback className="bg-blue-600 text-white font-bold">{member.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.role} • {member.age} years</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Blood Group</span>
                    <span className="text-lg font-bold text-slate-900">{member.bloodGroup}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Records</span>
                    <span className="text-lg font-bold text-blue-600">{member.records}</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center space-x-3">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  <div className="text-xs text-rose-900 leading-tight">
                    <span className="font-bold">Medical Alert:</span> Penicillin Allergy (Level 2)
                  </div>
                </div>

                <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                  View Medical Vault <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        <button className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 space-y-4 hover:bg-white hover:border-blue-300 transition-all group min-h-[350px]">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <Plus className="h-8 w-8 text-slate-400 group-hover:text-blue-600" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-900">Add Member</h3>
            <p className="text-sm text-slate-500">Securely store data for children or parents.</p>
          </div>
        </button>
      </div>
    </div>
  );
}
