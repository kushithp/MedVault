import * as React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye,
  FileSearch,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  UploadCloud
} from "lucide-react";
import { motion } from "motion/react";
import { db } from "@/src/lib/firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy,
  doc,
  deleteDoc
} from "firebase/firestore";
import { useAuthStore } from "@/src/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ExportModal } from "@/src/components/export/ExportModal";

export default function Records() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [records, setRecords] = React.useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = React.useState<any | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [familyMembers, setFamilyMembers] = React.useState<any[]>([]);

  // Fetch records and family members from Firestore
  React.useEffect(() => {
    if (!user) return;

    const qFam = query(collection(db, "users", user.uid, "familyMembers"));
    const unsubFam = onSnapshot(qFam, (snapshot) => {
      setFamilyMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const q = query(
      collection(db, "users", user.uid, "reports"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecords(docs);
    }, (error) => {
      console.error(error);
      toast.error("Failed to sync records.");
    });

    return () => {
      unsubscribe();
      unsubFam();
    };
  }, [user]);

  const getPatientName = (memberId: string | null) => {
    if (!memberId) return "Primary (Me)";
    const member = familyMembers.find(m => m.id === memberId);
    return member ? member.name : "Member";
  };

  const filteredRecords = records.filter(r => 
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.bodyPart?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "reports", id));
      toast.success("Record deleted");
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <header className="glass-header h-20 flex items-center justify-between px-6 lg:px-10 shrink-0">
        <div className="flex items-center bg-[#F1F5F9] rounded-xl px-4 py-2 text-[#94A3B8] w-full max-w-[200px] sm:max-w-xs transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white border border-transparent focus-within:border-blue-200">
          <Search className="h-4 w-4 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search vault..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center space-x-3 sm:space-x-6">
          <Button 
            onClick={() => navigate('/upload')}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow-lg shadow-blue-100 h-11 px-4 sm:px-6 gap-2"
          >
            <UploadCloud className="h-4 w-4" /> 
            <span className="hidden sm:inline">Analyze Scan</span>
          </Button>
          <div className="h-10 w-10 border-2 border-white rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 shadow-sm shrink-0">
            {user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase() || "JD"}
          </div>
        </div>
      </header>

      <main className="scroll-container custom-scrollbar p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-[#1E293B] tracking-tight">Radiology Vault</h1>
              <p className="text-sm text-[#64748B] font-medium">Manage your clinical history and AI diagnostics.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="h-10 rounded-xl border-[#E2E8F0] bg-white text-xs font-bold px-4">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="py-24 text-center space-y-6">
              <div className="h-24 w-24 bg-white border border-[#E2E8F0] rounded-3xl flex items-center justify-center mx-auto shadow-sm ring-8 ring-slate-50">
                <FileSearch className="h-10 w-10 text-[#CBD5E1]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#1E293B]">
                  {searchQuery ? "No matching records" : "Your vault is empty"}
                </h3>
                <p className="text-[#64748B] max-w-sm mx-auto font-medium">
                  {searchQuery ? "Try a different search term or clear the filter." : "Upload your medical reports to build a centralized health history."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecords.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm hover:border-[#2563EB] transition-all group flex flex-col h-full">
                    <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#F8FAFC] flex items-center justify-center text-[#2563EB]">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1E293B] leading-tight truncate max-w-[150px]">{record.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">{record.date}</p>
                            <span className="text-[10px] text-blue-600 font-bold px-1.5 py-0.5 bg-blue-50 rounded">
                              {getPatientName(record.familyMemberId)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider", getRiskColor(record.riskLevel))}>
                        {record.riskLevel || 'Low'} Risk
                      </Badge>
                    </div>
                    
                    <div className="p-5 flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-[#EFF6FF] text-[#2563EB] border-transparent text-[10px]">
                          {record.category || 'Radiology'}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-transparent text-[10px]">
                          {record.bodyPart || 'Unspecified'}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-[#475569] line-clamp-3 leading-relaxed italic">
                        "{record.simpleSummary || 'Self-extracted summary available in details.'}"
                      </p>

                      {record.riskLevel === 'High' || record.riskLevel === 'Critical' ? (
                        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-2 rounded-lg text-[10px] font-bold">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Action required: Consult specialist</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="p-5 flex items-center gap-2 mt-auto border-t border-[#E2E8F0] bg-[#F8FAFC]">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/summaries', { state: { reportId: record.id } })}
                        className="flex-1 h-9 rounded-lg border-[#E2E8F0] text-xs font-bold bg-white"
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" /> Details
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedRecord(record);
                          setIsExportModalOpen(true);
                        }}
                        className="h-9 w-9 p-0 rounded-lg border-[#E2E8F0] text-blue-500 hover:bg-blue-50 hover:border-blue-100 bg-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-9 w-9 p-0 rounded-lg border-[#E2E8F0] text-rose-500 hover:bg-rose-50 hover:border-rose-100 bg-white"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ExportModal 
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        reportData={selectedRecord}
      />
      
      {/* Footer Disclaimer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-3 px-8 text-center shrink-0">
        <p className="text-[10px] text-[#94A3B8] font-medium italic">
          Disclaimer: MedVault AI summaries are for educational purposes. Always consult a qualified physician for clinical diagnosis.
        </p>
      </footer>
    </div>
  );
}
