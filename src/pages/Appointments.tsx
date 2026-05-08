import * as React from "react";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  User, 
  Clock, 
  Plus, 
  Phone,
  ArrowRight,
  Loader2,
  Trash2
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/authStore";
import { toast } from "sonner";
import { format } from "date-fns";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  type: string;
}

export default function Appointments() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  // Form state
  const [newDoctor, setNewDoctor] = React.useState("");
  const [newSpecialty, setNewSpecialty] = React.useState("");
  const [newTime, setNewTime] = React.useState("09:00");
  const [newLocation, setNewLocation] = React.useState("");
  const [newType, setNewType] = React.useState("Follow-up");

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "appointments"),
      orderBy("date", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDoctor || !selectedDate) return;

    try {
      await addDoc(collection(db, "users", user.uid, "appointments"), {
        doctor: newDoctor,
        specialty: newSpecialty,
        date: format(selectedDate, "yyyy-MM-dd"), // Sortable format
        dateDisplay: format(selectedDate, "MMM dd, yyyy"),
        time: newTime,
        location: newLocation,
        type: newType,
        createdAt: serverTimestamp()
      });

      toast.success("Appointment scheduled");
      setIsAddModalOpen(false);
      setNewDoctor("");
      setNewSpecialty("");
      setNewLocation("");
    } catch (error) {
      toast.error("Failed to schedule appointment");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm("Cancel this appointment?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "appointments", id));
      toast.success("Appointment cancelled");
    } catch (error) {
      toast.error("Failed to cancel");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <header className="glass-header h-16 flex items-center justify-between px-6 lg:px-8 shrink-0">
        <h1 className="text-xl font-bold text-[#1E293B]">Clinical Calendar</h1>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        <div className="lg:col-span-4 p-8 border-r bg-white scroll-container custom-scrollbar space-y-8">
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
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6">
                <Plus className="mr-2 h-5 w-5" /> Schedule New Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule Medical Visit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSchedule} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor Name</Label>
                  <Input id="doctor" value={newDoctor} onChange={(e) => setNewDoctor(e.target.value)} placeholder="e.g. Dr. Sarah Johnson" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spec">Specialty</Label>
                  <Input id="spec" value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} placeholder="e.g. Cardiologist" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-center flex flex-col items-center">
                    <Label className="mb-2">Selected Date</Label>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm">
                      {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Pick on left calendar"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loc">Location</Label>
                  <Input id="loc" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Hospital name or room..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Visit Type</Label>
                  <Input id="type" value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="e.g. Follow-up" />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Confirm Schedule</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="lg:col-span-8 p-8 scroll-container custom-scrollbar space-y-6">
          <h2 className="text-xl font-bold">Upcoming Visits</h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading your schedule...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Your clinical calendar is currently empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt, i) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
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
                            <MapPin className="h-3 w-3 mr-1" /> {apt.location || "Online Consultation"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center p-4 bg-slate-50 rounded-xl md:min-w-[140px]">
                        <div className="flex items-center text-sm font-bold text-slate-900">
                          <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" /> {(apt as any).dateDisplay || apt.date}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 mt-1">
                          <Clock className="h-4 w-4 mr-2 text-slate-400" /> {apt.time}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleDelete(apt.id)} className="text-slate-400 hover:text-rose-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline">
                          Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  </div>
);
}

