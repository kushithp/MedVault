import * as React from "react";
import { 
  Pill, 
  Plus, 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  Loader2
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
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/authStore";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { toast } from "sonner";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  remains: number;
  total: number;
  color?: string;
  bg?: string;
}

export default function Medicines() {
  const { user } = useAuthStore();
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  
  // New medicine form state
  const [newName, setNewName] = React.useState("");
  const [newDosage, setNewDosage] = React.useState("");
  const [newSchedule, setNewSchedule] = React.useState("");
  const [newTotal, setNewTotal] = React.useState("30");

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "medicines"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedicines(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Medicine)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName) return;

    try {
      const colors = ["text-blue-600", "text-emerald-600", "text-amber-600", "text-rose-600", "text-indigo-600"];
      const bgs = ["bg-blue-50", "bg-emerald-50", "bg-amber-50", "bg-rose-50", "bg-indigo-50"];
      const randomIndex = Math.floor(Math.random() * colors.length);

      await addDoc(collection(db, "users", user.uid, "medicines"), {
        name: newName,
        dosage: newDosage,
        schedule: newSchedule,
        total: parseInt(newTotal) || 30,
        remains: parseInt(newTotal) || 30,
        color: colors[randomIndex],
        bg: bgs[randomIndex],
        createdAt: new Date().toISOString()
      });

      toast.success("Medicine added successfully");
      setIsAddModalOpen(false);
      setNewName("");
      setNewDosage("");
      setNewSchedule("");
      setNewTotal("30");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add medicine");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "medicines", id));
      toast.success("Medicine deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleMarkAsTaken = async (med: Medicine) => {
    if (!user || med.remains <= 0) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "medicines", med.id), {
        remains: med.remains - 1
      });
      toast.success(`${med.name} dose recorded`);
    } catch (error) {
      toast.error("Failed to record dose");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <header className="glass-header h-16 flex items-center justify-between px-6 lg:px-8 shrink-0">
        <h1 className="text-xl font-bold text-[#1E293B]">Medication Tracker</h1>
      </header>

      <main className="scroll-container custom-scrollbar px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medicine Tracker</h1>
            <p className="text-slate-500">Manage your daily medications and refill reminders.</p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMedicine} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medicine Name</Label>
                  <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Atorvastatin" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input id="dosage" value={newDosage} onChange={(e) => setNewDosage(e.target.value)} placeholder="e.g. 20mg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total">Total Pills</Label>
                    <Input id="total" type="number" value={newTotal} onChange={(e) => setNewTotal(e.target.value)} placeholder="30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input id="schedule" value={newSchedule} onChange={(e) => setNewSchedule(e.target.value)} placeholder="e.g. Once daily (Night)" />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save Medication</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading your medications...</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No medicines added yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-6">Start tracking your medications and get refill reminders automatically.</p>
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>Add your first medicine</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {medicines.map((med, i) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow group relative overflow-hidden">
                <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                  <div className={`${med.bg || 'bg-blue-50'} p-3 rounded-xl`}>
                    <Pill className={`h-6 w-6 ${med.color || 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{med.name}</CardTitle>
                    <CardDescription>{med.dosage}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className={med.remains < 7 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}>
                      {med.remains} left
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="mr-2 h-4 w-4 text-slate-400" /> {med.schedule}
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Refill Progress</span>
                      <span>{Math.round((med.remains / (med.total || 30)) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(med.remains / (med.total || 30)) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${med.remains < 7 ? "bg-rose-500" : "bg-blue-600"}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleMarkAsTaken(med)}
                      disabled={med.remains <= 0}
                    >
                      <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Taken
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(med.id)}
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  {med.remains < 7 && (
                    <div className="flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg animate-pulse">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Threshold low! Consider refilling soon.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      </main>
    </div>
  );
}

