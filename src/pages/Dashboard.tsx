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
  const [counts, setCounts] = React.useState({ reports: 0, medicines: 0, family: 0 });
  const [loading, setLoading] = React.useState(true);

  const [upcomingMeds, setUpcomingMeds] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!user) return;

    // Reports Listener
    const qReports = query(
      collection(db, "users", user.uid, "reports"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubReports = onSnapshot(qReports, (snapshot) => {
      setRecentReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCounts(prev => ({ ...prev, reports: snapshot.size }));
    });

    // Medicines Listener
    const qMeds = query(collection(db, "users", user.uid, "medicines"));
    const unsubMeds = onSnapshot(qMeds, (snapshot) => {
      setCounts(prev => ({ ...prev, medicines: snapshot.size }));
    });

    // Family Listener
    const qFamily = query(collection(db, "users", user.uid, "familyMembers"));
    const unsubFamily = onSnapshot(qFamily, (snapshot) => {
      setCounts(prev => ({ ...prev, family: snapshot.size }));
    });

    // Meds List Listener for Tracker
    const qMedsList = query(
      collection(db, "users", user.uid, "medicines"),
      limit(2)
    );
    const unsubMedsList = onSnapshot(qMedsList, (snapshot) => {
      setUpcomingMeds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubReports();
      unsubMeds();
      unsubFamily();
      unsubMedsList();
    };
  }, [user]);

  const healthScore = React.useMemo(() => {
    if (recentReports.length === 0) return 100;
    const avgConfidence = recentReports.reduce((acc, r) => (acc + (r.confidenceScore || 0.8)), 0) / recentReports.length;
    return Math.round(avgConfidence * 100);
  }, [recentReports]);

  const latestInsight = React.useMemo(() => {
    if (recentReports.length === 0) return "Upload your first medical report to generate AI health insights and track your progress.";
    const report = recentReports[0];
    return `${report.simpleSummary || report.summary || "Your latest report is analyzed."} AI suggests: ${report.recommendations?.[0] || "Continue following your clinical advice."}`;
  }, [recentReports]);

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

      <main className="scroll-container custom-scrollbar p-4 sm:p-8">
        <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
          {/* Stat Grid */}
          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Total Reports", value: counts.reports, change: "+3 this month", changeColor: "text-[#10B981]", icon: FileText },
              { title: "Active Medicines", value: counts.medicines, subtitle: "Next dose: 2:00 PM", icon: Clock },
              { title: "AI Health Score", value: `${healthScore}/100`, progress: healthScore, icon: TrendingUp },
              { title: "Family Members", value: counts.family, avatars: ["bg-[#DBEAFE]", "bg-[#FCE7F3]", "bg-[#FEF3C7]"], icon: Users },
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
                    <div className="text-xs text-[#64748B] font-medium">{report.reportType || 'General'} • {report.date}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className={cn(
                      "px-3 py-1 text-[10px] uppercase font-bold",
                      report.riskLevel === 'Low' ? "bg-emerald-50 text-emerald-700" :
                      report.riskLevel === 'High' ? "bg-rose-50 text-rose-700" :
                      report.riskLevel === 'Critical' ? "bg-rose-100 text-rose-900 border-rose-200" :
                      "bg-blue-50 text-blue-700"
                    )}>
                      {report.riskLevel || 'ANALYZED'} Findings
                    </Badge>
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
                {latestInsight}
              </p>
            </div>
          </div>

          {/* Medicine Tracker */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1E293B]">Medicine Tracker</h2>
              <Link to="/medicines" className="text-xs font-bold text-blue-600">Open Tracker</Link>
            </div>
            
            {upcomingMeds.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-[#94A3B8]">
                <p className="text-xs font-bold">No medicines tracked</p>
              </div>
            ) : (
              upcomingMeds.map((med) => (
                <div key={med.id} className="bg-white border border-[#E2E8F0] border-l-4 border-l-[#2563EB] rounded-xl p-5 shadow-sm">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Next Dose</div>
                  <div className="font-bold text-[#1E293B] mb-1">{med.name} ({med.dosage})</div>
                  <div className="text-xs text-[#64748B] mb-4">{med.schedule}</div>
                  <Button 
                    variant="outline" 
                    className="w-full bg-[#F8FAFC] border-[#E2E8F0] text-xs font-bold h-9"
                    onClick={async () => {
                      if (!user || med.remains <= 0) return;
                      await updateDoc(doc(db, "users", user.uid, "medicines", med.id), {
                        remains: med.remains - 1
                      });
                      toast.success(`${med.name} dose recorded`);
                    }}
                  >
                    Mark as Taken
                  </Button>
                </div>
              ))
            )}

            <Link to="/medicines" className="bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl p-6 flex flex-col items-center justify-center text-[#94A3B8] group cursor-pointer hover:bg-slate-50 transition-colors">
              <Plus className="h-6 w-6 mb-2 group-hover:text-[#2563EB]" />
              <span className="text-xs font-bold">Manage Schedule</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
