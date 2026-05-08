import * as React from "react";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  User, 
  Clock, 
  Plus, 
  Phone,
  ArrowRight
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
import { Calendar } from "@/components/ui/calendar";

const appointments = [
  { id: 1, doctor: "Dr. Sarah Johnson", specialty: "Cardiologist", time: "09:30 AM", date: "May 15, 2024", location: "City Hospital, Wing B", type: "Follow-up" },
  { id: 2, doctor: "Dr. Michael Chen", specialty: "General Practitioner", time: "02:00 PM", date: "May 22, 2024", location: "Grace Clinic, Room 402", type: "Regular Checkup" },
];

export default function Appointments() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 h-full bg-slate-50/30 overflow-hidden">
      <div className="lg:col-span-4 p-8 border-r bg-white h-full overflow-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-slate-500">Keep track of your medical consultations.</p>
        </div>

        <Card className="border-none shadow-none ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6">
          <Plus className="mr-2 h-5 w-5" /> Schedule New Visit
        </Button>
      </div>

      <div className="lg:col-span-8 p-8 h-full overflow-auto space-y-6">
        <h2 className="text-xl font-bold">Upcoming Visits</h2>
        
        <div className="space-y-4">
          {appointments.map((apt, i) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg">{apt.doctor}</h3>
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tight">
                            {apt.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-600 font-medium">{apt.specialty}</p>
                        <div className="flex items-center text-xs text-slate-500 mt-2">
                          <MapPin className="h-3 w-3 mr-1" /> {apt.location}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center p-4 bg-slate-50 rounded-xl md:min-w-[140px]">
                      <div className="flex items-center text-sm font-bold text-slate-900">
                        <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" /> {apt.date}
                      </div>
                      <div className="flex items-center text-sm text-slate-600 mt-1">
                        <Clock className="h-4 w-4 mr-2 text-slate-400" /> {apt.time}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline">
                        Action <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
