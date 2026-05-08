import * as React from "react";
import { 
  Pill, 
  Plus, 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
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
import { Badge } from "@/components/ui/badge";

const medicines = [
  { name: "Atorvastatin", dosage: "20mg", schedule: "Once daily (Night)", remains: 12, total: 30, color: "text-blue-600", bg: "bg-blue-50" },
  { name: "Metformin", dosage: "500mg", schedule: "Twice daily (Meal)", remains: 5, total: 60, color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Lisinopril", dosage: "10mg", schedule: "Once daily (Morning)", remains: 22, total: 30, color: "text-amber-600", bg: "bg-amber-50" },
];

export default function Medicines() {
  return (
    <div className="p-8 space-y-8 bg-slate-50/30 h-full overflow-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicine Tracker</h1>
          <p className="text-slate-500">Manage your daily medications and refill reminders.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Medicine
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {medicines.map((med, i) => (
          <motion.div
            key={med.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow group">
              <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                <div className={`${med.bg} p-3 rounded-xl`}>
                  <Pill className={`h-6 w-6 ${med.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{med.name}</CardTitle>
                  <CardDescription>{med.dosage}</CardDescription>
                </div>
                <Badge className={med.remains < 7 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}>
                  {med.remains} left
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="mr-2 h-4 w-4 text-slate-400" /> {med.schedule}
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Refill Progress</span>
                    <span>{Math.round((med.remains / med.total) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(med.remains / med.total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${med.remains < 7 ? "bg-rose-500" : "bg-blue-600"}`}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Taken
                  </Button>
                  <Button variant="outline" size="sm" className="group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Bell className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                {med.remains < 7 && (
                  <div className="flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Threshold low! Consider refilling soon.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
