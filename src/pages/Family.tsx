import * as React from "react";
import { 
  Users, 
  Plus, 
  Baby, 
  User, 
  Heart, 
  MoreHorizontal,
  ChevronRight,
  ShieldAlert,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/authStore";
import { toast } from "sonner";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  bloodGroup: string;
  allergies?: string;
  avatar?: string;
}

export default function Family() {
  const { user } = useAuthStore();
  const [members, setMembers] = React.useState<FamilyMember[]>([]);
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  // Form state
  const [newName, setNewName] = React.useState("");
  const [newRel, setNewRel] = React.useState("");
  const [newAge, setNewAge] = React.useState("");
  const [newBlood, setNewBlood] = React.useState("");
  const [newAllergies, setNewAllergies] = React.useState("");

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "familyMembers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FamilyMember)));
      setLoading(false);
    });

    // Fetch reports to count them
    const qReports = query(collection(db, "users", user.uid, "reports"));
    const unsubReports = onSnapshot(qReports, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      unsubReports();
    };
  }, [user]);

  const getReportCount = (memberId: string) => {
    return reports.filter(r => r.familyMemberId === memberId).length;
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName) return;

    try {
      await addDoc(collection(db, "users", user.uid, "familyMembers"), {
        name: newName,
        relationship: newRel,
        age: parseInt(newAge) || 0,
        bloodGroup: newBlood,
        allergies: newAllergies,
        avatar: newName.split(" ").map(n => n[0]).join("").toUpperCase(),
        createdAt: serverTimestamp()
      });

      toast.success(`${newName} added to family vault`);
      setIsAddModalOpen(false);
      setNewName("");
      setNewRel("");
      setNewAge("");
      setNewBlood("");
      setNewAllergies("");
    } catch (error) {
      toast.error("Failed to add family member");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!user || !window.confirm(`Remove ${name} from your family vault?`)) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "familyMembers", id));
      toast.success("Member removed");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <header className="glass-header h-16 flex items-center justify-between px-6 lg:px-8 shrink-0">
        <h1 className="text-xl font-bold text-[#1E293B]">Family Management</h1>
      </header>

      <main className="scroll-container custom-scrollbar px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Family Health Vault</h1>
            <p className="text-slate-500">Manage health records for your entire family in one place.</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add Family Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Emily Doe" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rel">Relationship</Label>
                    <Input id="rel" value={newRel} onChange={(e) => setNewRel(e.target.value)} placeholder="e.g. Spouse" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" value={newAge} onChange={(e) => setNewAge(e.target.value)} placeholder="34" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood">Blood Group</Label>
                  <Input id="blood" value={newBlood} onChange={(e) => setNewBlood(e.target.value)} placeholder="e.g. O+" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Medical Alerts / Allergies</Label>
                  <Input id="allergies" value={newAllergies} onChange={(e) => setNewAllergies(e.target.value)} placeholder="e.g. Penicillin Allergy" />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save Member</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading family profiles...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member, i) => (
            <motion.div
              key={member.id}
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
                    <CardDescription>{member.relationship} • {member.age} years</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(member.id, member.name);
                    }}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Blood Group</span>
                      <span className="text-lg font-bold text-slate-900">{member.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Reports</span>
                      <span className="text-lg font-bold text-blue-600">{getReportCount(member.id)}</span>
                    </div>
                  </div>
                  
                  {member.allergies && (
                    <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center space-x-3">
                      <ShieldAlert className="h-5 w-5 text-rose-600" />
                      <div className="text-xs text-rose-900 leading-tight">
                        <span className="font-bold">Medical Alert:</span> {member.allergies}
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/records')}
                    className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors"
                  >
                    View Medical Vault <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 space-y-4 hover:bg-white hover:border-blue-300 transition-all group min-h-[350px]"
          >
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <Plus className="h-8 w-8 text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900">Add Member</h3>
              <p className="text-sm text-slate-500">Securely store data for children or parents.</p>
            </div>
          </button>
        </div>
      )}
      </main>
    </div>
  );
}

