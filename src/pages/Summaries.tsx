import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Search, 
  Sparkles,
  FileText,
  ChevronRight,
  Download,
  Share2,
  Copy,
  AlertCircle,
  Activity,
  CheckCircle2,
  Info,
  History,
  TrendingDown,
  Scale,
  Plus,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { useAuthStore } from "@/src/store/authStore";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { 
  ScrollArea 
} from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { compareReports } from "@/src/lib/gemini";
import { ExportModal } from "@/src/components/export/ExportModal";
export default function Summaries() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [records, setRecords] = React.useState<any[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(location.state?.reportId || null);
  const [compareMode, setCompareMode] = React.useState(false);
  const [compareId, setCompareId] = React.useState<string | null>(null);
  const [comparisonText, setComparisonText] = React.useState<string | null>(null);
  const [isComparing, setIsComparing] = React.useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showRawText, setShowRawText] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(docs);
    });
    return () => unsubscribe();
  }, [user]);

  const selectedRecord = records.find(r => r.id === selectedId) || records[0];

  const handleCompare = async () => {
    if (!selectedId || !compareId || selectedId === compareId) {
      toast.error("Please select two different reports to compare.");
      return;
    }

    const report1 = records.find(r => r.id === selectedId);
    const report2 = records.find(r => r.id === compareId);

    if (!report1?.ocrText || !report2?.ocrText) {
      toast.error("One or both reports are missing text data for comparison.");
      return;
    }

    setIsComparing(true);
    setComparisonText(null);
    try {
      const result = await compareReports(report1.ocrText, report2.ocrText);
      setComparisonText(result);
    } catch (error) {
      toast.error("Failed to compare reports.");
    } finally {
      setIsComparing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Moderate': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden relative">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-80 border-r border-[#E2E8F0] bg-white flex flex-col h-full shrink-0 z-50 lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-[#E2E8F0] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-[#2563EB]" />
              <h2 className="text-xl font-bold text-[#1E293B]">Health Library</h2>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCompareMode(!compareMode)}
                className={cn("h-8 w-8 rounded-lg", compareMode ? "bg-blue-50 text-blue-600" : "text-slate-400")}
                title="Comparison Mode"
              >
                <Scale className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input 
              placeholder="Search library..." 
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 custom-scrollbar">
          <div className="p-3 space-y-1">
            {records.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#64748B]">
                No reports analyzed yet.
              </div>
            ) : (
              records.map((record) => (
                <div key={record.id} className="flex items-center gap-2">
                  {compareMode && (
                    <input 
                      type="checkbox" 
                      onChange={() => setCompareId(record.id === compareId ? null : record.id)}
                      checked={compareId === record.id}
                      className="ml-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                  <button
                    onClick={() => setSelectedId(record.id)}
                    className={cn(
                      "flex-1 flex items-center justify-between p-4 rounded-xl text-left transition-all group",
                      (selectedId === record.id || (!selectedId && selectedRecord?.id === record.id))
                        ? "bg-[#EFF6FF] text-[#2563EB]"
                        : "hover:bg-[#F8FAFC] text-[#64748B]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className={cn(
                        "text-sm font-bold truncate",
                        (selectedId === record.id || (!selectedId && selectedRecord?.id === record.id)) ? "text-[#2563EB]" : "text-[#1E293B]"
                      )}>
                        {record.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 font-mono italic">{record.date}</span>
                        {record.riskLevel && (
                          <span className={cn("text-[8px] font-bold px-1.5 rounded-full border", getRiskColor(record.riskLevel))}>
                            {record.riskLevel}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      (selectedId === record.id || (!selectedId && selectedRecord?.id === record.id)) ? "translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                    )} />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        {compareMode && compareId && selectedId && (
          <div className="p-4 border-t bg-slate-50">
            <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]" onClick={handleCompare} disabled={isComparing}>
              {isComparing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Scale className="h-4 w-4 mr-2" />}
              Compare Reports
            </Button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0 bg-white relative transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-[60] w-full h-full" : "relative h-full"
      )}>
        {selectedRecord ? (
          <>
            <header className="glass-header h-20 flex items-center justify-between px-6 lg:px-10 shrink-0">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden h-10 w-10 text-slate-500"
                >
                  <History className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] border flex items-center justify-center text-[#2563EB] hidden sm:flex">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg lg:text-xl font-bold text-[#1E293B] truncate max-w-[150px] sm:max-w-xs">{selectedRecord.title}</h2>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    {selectedRecord.category || 'MedVault'} AI • {selectedRecord.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-10 w-10 p-0 rounded-xl border-[#E2E8F0] hidden sm:flex"
                >
                  {isFullscreen ? <TrendingDown className="h-4 w-4 rotate-180" /> : <TrendingDown className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsExportModalOpen(true)}
                  className="h-10 rounded-xl border-[#E2E8F0] text-xs font-bold px-3 lg:px-4 hidden sm:flex"
                >
                  <Share2 className="h-4 w-4 lg:mr-2" /> <span className="hidden lg:inline">Share</span>
                </Button>
                <Button 
                  onClick={() => setIsExportModalOpen(true)}
                  className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow-lg shadow-blue-100 px-4 lg:px-6"
                >
                  <Download className="h-4 w-4 lg:mr-2" /> <span className="hidden lg:inline">Export Analysis</span>
                </Button>
              </div>
            </header>
            <div className="scroll-container custom-scrollbar overflow-x-hidden">
              <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-10 pb-24 min-h-0">
                
                {/* Comparison Result Overlay */}
                <AnimatePresence>
                  {comparisonText && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-[#F1F5F9] border border-blue-200 rounded-2xl p-8 mb-12 shadow-inner relative"
                    >
                      <button 
                        onClick={() => setComparisonText(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
                      >
                        ✕
                      </button>
                      <div className="flex items-center gap-3 mb-6">
                        <Scale className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-800">Progression Comparison</h3>
                      </div>
                      <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-headings:font-bold">
                        <ReactMarkdown>{comparisonText}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={selectedRecord.id}
                  className="space-y-12"
                >
                  {/* AI Intro Card */}
                  <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white rounded-xl p-8 flex items-start space-x-6 shadow-lg shadow-blue-500/20">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-medium leading-relaxed italic opacity-95">
                        "{selectedRecord.simpleSummary || "I've analyzed your report. Here's a simple breakdown of the findings."}"
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Badge className="bg-white/20 text-[9px] uppercase tracking-wider">AI Confidence: {Math.round((selectedRecord.confidenceScore || 0.95) * 100)}%</Badge>
                        <Badge className="bg-white/20 text-[9px] uppercase tracking-wider">Patient-Friendly Language</Badge>
                      </div>
                    </div>
                  </div>

                  {/* High Level Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border rounded-xl p-5 shadow-sm space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" /> Risk Level
                      </div>
                      <div className={cn("text-xl font-black px-3 py-1 rounded-lg border w-fit", getRiskColor(selectedRecord.riskLevel || 'Low'))}>
                        {selectedRecord.riskLevel || 'Low'}
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-5 shadow-sm space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Analyzed Area
                      </div>
                      <div className="text-xl font-black text-slate-800">
                        {selectedRecord.bodyPart || 'General'}
                      </div>
                    </div>
                    <div className="bg-white border rounded-xl p-5 shadow-sm space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2">
                        <History className="h-3 w-3" /> Status
                      </div>
                      <div className="text-xl font-black text-emerald-600 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" /> Verified
                      </div>
                    </div>
                  </div>

                  {/* Findings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-rose-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> Abnormal Findings
                      </h3>
                      <div className="space-y-2">
                        {selectedRecord.abnormalFindings?.map((finding: string, i: number) => (
                          <div key={i} className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-sm text-rose-800 leading-relaxed font-medium">
                            {finding}
                          </div>
                        )) || <div className="text-slate-400 text-sm italic">No abnormal findings detected.</div>}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-md font-bold text-emerald-600 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Normal Observations
                      </h3>
                      <div className="space-y-2">
                        {selectedRecord.normalFindings?.map((finding: string, i: number) => (
                          <div key={i} className="bg-[#F8FAFC] border border-slate-100 p-4 rounded-xl text-sm text-[#475569] leading-relaxed font-medium">
                            {finding}
                          </div>
                        )) || <div className="text-slate-400 text-sm italic">Analysis complete.</div>}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Analysis (Old summary field used here if it's markdown) */}
                  <div className="space-y-6">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                      <Info className="h-4 w-4" /> Deep Dive Analysis
                    </h3>
                    <div className="prose prose-slate max-w-none prose-headings:text-[#1E293B] prose-headings:font-bold prose-p:text-[#475569] prose-p:leading-relaxed prose-strong:text-[#1E293B] prose-li:text-[#475569] bg-white border border-slate-100 p-8 rounded-2xl shadow-sm">
                      <ReactMarkdown>
                        {selectedRecord.summary || "Generating your smart summary..."}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* OCR Text Viewer Toggle */}
                  <div className="pt-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowRawText(!showRawText)}
                      className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-2 p-0"
                    >
                      <FileText className="h-4 w-4" />
                      {showRawText ? "Hide Raw Extracted Text" : "View Raw Extracted Text (OCR)"}
                    </Button>
                    
                    <AnimatePresence>
                      {showRawText && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-4"
                        >
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <pre className="text-[11px] font-mono text-slate-500 whitespace-pre-wrap leading-relaxed">
                              {selectedRecord.ocrText || "No raw text extracted for this report."}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Doctor Questions & Med Terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-6 space-y-4">
                      <h3 className="font-bold text-blue-800 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" /> Questions for your Doctor
                      </h3>
                      <div className="space-y-3">
                        {selectedRecord.questionsForDoctor?.map((q: string, i: number) => (
                          <div key={i} className="flex gap-2 text-sm text-blue-700">
                            <div className="h-1.5 w-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                            <span>{q}</span>
                          </div>
                        )) || <div className="text-slate-400 text-xs">Standard questions will appear here.</div>}
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 space-y-4">
                      <h3 className="font-bold text-slate-700">Medical Glossary</h3>
                      <div className="space-y-3">
                        {selectedRecord.medicalTerms && Object.entries(selectedRecord.medicalTerms).map(([term, desc], i) => (
                          <div key={i} className="space-y-1">
                            <div className="text-xs font-black text-slate-800 underline decoration-blue-200 decoration-2 underline-offset-4">{term}</div>
                            <div className="text-xs text-slate-500 leading-relaxed italic">{desc as string}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Medical Disclaimer Section */}
                  <div className="bg-rose-50 border-l-4 border-rose-400 p-6 rounded-r-2xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-bold">
                      <AlertCircle className="h-4 w-4" /> Important Medical Disclaimer
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed font-medium">
                      This AI-generated summary is for informational and educational purposes only. It is not an official medical diagnosis, professional medical advice, or treatment plan. Large Language Models can occasionally hallucinate or misinterpret complex clinical jargon. 
                      <strong className="block mt-2">DO NOT make healthcare decisions based solely on this summary. Always share the original diagnostic report with your board-certified specialist.</strong>
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
            <ExportModal 
              isOpen={isExportModalOpen} 
              onOpenChange={setIsExportModalOpen} 
              reportData={selectedRecord} 
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="max-w-md space-y-8 px-6">
              <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-100 ring-1 ring-slate-100">
                <Sparkles className="h-10 w-10 text-blue-600" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B]">AI Diagnostic Assistant</h2>
                <p className="text-slate-500 leading-relaxed font-medium">Select a scan from your vault to generate a smart clinical breakdown and risk assessment.</p>
              </div>
              <Button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden bg-blue-600 rounded-xl px-8"
              >
                Browse Reports
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
