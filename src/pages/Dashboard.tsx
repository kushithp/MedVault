import * as React from "react";
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Plus,
  ShieldCheck,
  ChevronRight,
  Search,
  Sparkles,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/src/store/authStore";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [recentReports, setRecentReports] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ total: 0, pending: 0 });

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "reports"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentReports(docs);
      setStats(prev => ({ ...prev, total: snapshot.size }));
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <header className="glass-header h-16 flex items-center justify-between px-6 lg:px-8 shrink-0">
        <div className="hidden sm:flex items-center bg-[#F1F5F9] rounded-xl px-4 py-2 w-80 text-[#94A3B8]">
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm">Search records...</span>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-6">
          <Link to="/upload">
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow-lg shadow-blue-100 h-10 px-4">
              + <span className="hidden sm:inline">Upload Report</span><span className="sm:hidden">Upload</span>
            </Button>
          </Link>
          <div className="h-10 w-10 border-2 border-white rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 shadow-sm shrink-0">
            {user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase() || "JD"}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
        <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
          {/* Stat Grid */}
          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Total Reports", value: recentReports.length, change: "+3 this month", changeColor: "text-[#10B981]", icon: FileText },
              { title: "Active Medicines", value: "4", subtitle: "Next dose: 2:00 PM", icon: Clock },
              { title: "AI Health Score", value: "88/100", progress: 88, icon: TrendingUp },
              { title: "Family Members", value: "3", avatars: ["bg-[#DBEAFE]", "bg-[#FCE7F3]", "bg-[#FEF3C7]"], icon: Users },
            ].map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm"
              >
                <div className="text-[#64748B] text-sm font-medium mb-2">{stat.title}</div>
                <div className="text-2xl font-bold text-[#1E293B]">{stat.value}</div>
                {stat.change && <div className={cn("text-xs mt-1 font-medium", stat.changeColor)}>{stat.change}</div>}
                {stat.subtitle && <div className="text-xs mt-1 text-[#64748B] font-medium">{stat.subtitle}</div>}
                {stat.progress && (
                  <div className="h-1 bg-[#F1F5F9] rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${stat.progress}%` }} />
                  </div>
                )}
                {stat.avatars && (
                  <div className="flex mt-3">
                    {stat.avatars.map((bg, idx) => (
                      <div key={idx} className={cn("h-6 w-6 rounded-full border-2 border-white -mr-2", bg)} />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Reports List */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold text-[#1E293B]">Recent Medical Reports</h2>
              <Link to="/records" className="text-[#2563EB] text-sm font-semibold hover:underline">
                View All
              </Link>
            </div>

            {recentReports.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center text-[#64748B] shadow-sm">
                No reports found in your vault yet.
              </div>
            ) : (
              recentReports.map((report) => (
                <div key={report.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4 shadow-sm group hover:border-[#2563EB] transition-all">
                  <div className="h-10 w-10 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#2563EB]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#1E293B]">{report.title}</div>
                    <div className="text-xs text-[#64748B]">Quest Diagnostics • {report.date}</div>
                  </div>
                  <div className="flex space-x-2">
                    <span className="bg-[#DCFCE7] text-[#166534] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Normal Findings
                    </span>
                    <span className="bg-[#DBEAFE] text-[#1E40AF] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      AI Summarized
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* AI Summary Card */}
            <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white rounded-xl p-6 shadow-lg shadow-blue-500/20 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5" />
                <span className="font-bold">AI Medical Insight</span>
              </div>
              <p className="text-sm leading-relaxed opacity-95">
                Based on your latest blood report, your <strong>LDL Cholesterol</strong> has decreased by 12% from your last test. This indicates your current dietary changes are effective. AI recommends maintaining your current routine and adding 15 mins of morning sunlight.
              </p>
            </div>
          </div>

          {/* Medicine Tracker */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-[#1E293B]">Medicine Tracker</h2>
            
            <div className="bg-white border border-[#E2E8F0] border-l-4 border-l-[#2563EB] rounded-xl p-5 shadow-sm">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Next Dose: 2:00 PM</div>
              <div className="font-bold text-[#1E293B] mb-1">Atorvastatin (20mg)</div>
              <div className="text-xs text-[#64748B] mb-4">1 tablet • After lunch</div>
              <Button variant="outline" className="w-full bg-[#F8FAFC] border-[#E2E8F0] text-xs font-bold h-9">
                Mark as Taken
              </Button>
            </div>

            <div className="bg-white border border-[#E2E8F0] border-l-4 border-l-[#E2E8F0] rounded-xl p-5 shadow-sm opacity-80">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Evening: 8:00 PM</div>
              <div className="font-bold text-[#1E293B] mb-1">Vitamin D3 (2000 IU)</div>
              <div className="text-xs text-[#64748B]">1 capsule • With dinner</div>
            </div>

            <div className="bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl p-6 flex flex-col items-center justify-center text-[#94A3B8] group cursor-pointer hover:bg-slate-50 transition-colors">
              <Plus className="h-6 w-6 mb-2 group-hover:text-[#2563EB]" />
              <span className="text-xs font-bold">Add reminder</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
