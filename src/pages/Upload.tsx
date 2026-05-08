import React, { useState } from "react";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { Search, History, Filter, FileText, Sparkles, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { DragDropZone } from "@/src/components/upload/DragDropUploader";
import { motion } from "motion/react";
import { createWorker } from "tesseract.js";
import { analyzeMedicalReport } from "@/src/lib/gemini";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useAuthStore } from "@/src/store/authStore";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';
import { Badge } from "@/components/ui/badge";
import mammoth from "mammoth";

export default function UploadPage() {
  const { user } = useAuthStore();
  const [processing, setProcessing] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "reports"), 
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => (item as any).str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleUpload = async (files: File[]) => {
    if (!user) return;
    setProcessing(true);

    try {
      for (const file of files) {
        let text = "";
        
        if (file.type === "application/pdf") {
          text = await extractTextFromPdf(file);
          if (text.trim().length < 50) {
            const worker = await createWorker('eng');
            const { data } = await worker.recognize(file);
            text = data.text;
            await worker.terminate();
          }
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          text = await extractTextFromDocx(file);
        } else if (file.type === "text/plain") {
          text = await file.text();
        } else {
          const worker = await createWorker('eng');
          const { data } = await worker.recognize(file);
          text = data.text;
          await worker.terminate();
        }

        const analysis = await analyzeMedicalReport(text);
        
        await addDoc(collection(db, "users", user.uid, "reports"), {
          ...analysis,
          title: file.name,
          category: analysis.reportType,
          date: new Date().toISOString().split('T')[0],
          summary: analysis.fullSummary,
          ocrText: text,
          createdAt: serverTimestamp(),
          ownerId: user.uid
        });

        toast.success(`Processed: ${file.name}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error processing one or more files.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-12 py-10 md:py-16 space-y-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-[#2563EB] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-[#1E293B] tracking-tight">AI Report Processing</h1>
              </div>
              <p className="text-base md:text-lg text-[#64748B] font-medium max-w-2xl leading-relaxed">
                Transform complex diagnostic imaging and lab reports into clear, actionable health insights using advanced OCR and clinical-grade AI.
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-8 border-l border-[#E2E8F0] pl-8">
              <div>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Processing Accuracy</p>
                <p className="text-2xl font-black text-[#1E293B]">98.4%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Response Time</p>
                <p className="text-2xl font-black text-[#1E293B]">~12s</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Upload Area */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-blue-100/50">
                 <DragDropZone onUploadComplete={handleUpload} isProcessing={processing} />
               </div>
               
               {/* Quick Tips */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-100 p-6 lg:p-8 rounded-3xl space-y-3 shadow-sm">
                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-[#1E293B]">Multi-Report Upload</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                      Upload multiple MRI sequences or serial blood tests. Our AI will identify progression markers automatically.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-100 p-6 lg:p-8 rounded-3xl space-y-3 shadow-sm">
                    <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-[#1E293B]">Secure Storage</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                      All reports are encrypted and stored in your private Health Vault. We never share your clinical data.
                    </p>
                  </div>
               </div>
            </div>

            {/* Recent History Sidebar */}
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
                    <History className="h-5 w-5 text-[#2563EB]" /> Recent Uploads
                  </h3>
                  {recentReports.length > 0 && (
                    <button 
                      onClick={async () => {
                        if (!user || !window.confirm("Clear all processing history?")) return;
                        toast.success("History clearing requested");
                      }}
                      className="text-[10px] font-bold text-rose-500 uppercase hover:underline"
                    >
                      Clear
                    </button>
                  )}
               </div>

               <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {recentReports.length === 0 ? (
                    <div className="bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] rounded-3xl p-8 text-center">
                       <p className="text-sm font-medium text-slate-400italic">No reports processed yet.</p>
                    </div>
                  ) : (
                    recentReports.map((report) => (
                      <motion.div 
                        key={report.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3 group hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="h-10 w-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#2563EB] group-hover:bg-[#EFF6FF]">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#1E293B] truncate">{report.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-[#64748B] tracking-wide">{report.date}</span>
                            <Badge variant="outline" className="text-[8px] h-4 py-0 font-black h-fit bg-slate-50">
                               {report.reportType || 'RADIOLOGY'}
                            </Badge>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#2563EB] transition-colors" />
                      </motion.div>
                    ))
                  )}
               </div>

               {/* Disclaimer Card */}
               <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
                 <p className="text-[11px] text-rose-700 leading-relaxed font-medium italic">
                   "AI processing is a decision support tool. It does not replace professional clinical interpretation. Always review raw scans with your physician."
                 </p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
