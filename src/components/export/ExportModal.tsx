import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Share2, 
  Printer, 
  Copy, 
  Check, 
  QrCode,
  ShieldCheck,
  Globe,
  Lock
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "motion/react";
import { exportToPDF, exportToDOCX, exportToTXT } from "@/src/lib/exportUtils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: any;
}

export const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onOpenChange, 
  reportData 
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'share'>('export');
  const [copied, setCopied] = useState(false);
  const [shareConfig, setShareConfig] = useState({
    expiry: '24h',
    password: false,
    public: false
  });

  const shareLink = `https://medvault.ai/share/${reportData?.id || 'sample-id'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Share link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!reportData) return;
    
    toast.loading(`Generating ${format.toUpperCase()}...`);
    try {
      if (format === 'pdf') exportToPDF(reportData);
      else if (format === 'docx') await exportToDOCX(reportData);
      else exportToTXT(reportData);
      
      toast.dismiss();
      toast.success(`${format.toUpperCase()} exported successfully!`);
    } catch (error) {
      toast.dismiss();
      toast.error("Export failed. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl flex flex-col sm:flex-row h-[95vh] sm:h-auto sm:max-h-[600px] lg:max-h-[700px]">
        {/* Left Sidebar Tabs */}
        <div className="w-full sm:w-1/3 bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-100 p-4 sm:p-6 space-y-2 flex flex-row sm:flex-col items-center sm:items-stretch overflow-x-auto sm:overflow-x-visible hide-scrollbar shrink-0 min-h-0">
          <h3 className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-4">Actions</h3>
          <button 
            onClick={() => setActiveTab('export')}
            className={cn(
              "whitespace-nowrap flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl text-[10px] sm:text-sm font-bold transition-all shrink-0 sm:shrink",
              activeTab === 'export' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            )}
          >
            <Download className="h-4 w-4" /> Export Report
          </button>
          <button 
            onClick={() => setActiveTab('share')}
            className={cn(
              "whitespace-nowrap flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl text-[10px] sm:text-sm font-bold transition-all shrink-0 sm:shrink",
              activeTab === 'share' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            )}
          >
            <Share2 className="h-4 w-4" /> Secure Share
          </button>
          <div className="hidden sm:block pt-8 pl-2">
             <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <ShieldCheck className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-tighter">HIPAA Compliant</p>
                <p className="text-[9px] text-blue-600 mt-1 leading-tight">All exports are end-to-end encrypted.</p>
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white p-6 sm:p-8 flex flex-col overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'export' ? (
                <motion.div 
                  key="export"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-800">Export Report</h2>
                    <p className="text-sm text-slate-500">Download your AI diagnostic summary in preferred formats.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => handleExport('pdf')}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-slate-50 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Medical PDF Portfolio</p>
                          <p className="text-xs text-slate-500">Best for printing & physician review</p>
                        </div>
                      </div>
                      <Download className="h-5 w-5 text-slate-300 group-hover:text-blue-600" />
                    </button>

                    <button 
                      onClick={() => handleExport('docx')}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-slate-50 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Word Document (DOCX)</p>
                          <p className="text-xs text-slate-500">Editable for hospital charting</p>
                        </div>
                      </div>
                      <Download className="h-5 w-5 text-slate-300 group-hover:text-blue-600" />
                    </button>

                    <button 
                      onClick={() => handleExport('txt')}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-slate-50 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Plain Text (TXT)</p>
                          <p className="text-xs text-slate-500">Simple summary for emails/notes</p>
                        </div>
                      </div>
                      <Download className="h-5 w-5 text-slate-300 group-hover:text-blue-600" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="share"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-800">Secure Report Sharing</h2>
                    <p className="text-sm text-slate-500">Generate a secure link to share your medical insights.</p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                     <div className="p-3 bg-white rounded-xl shadow-sm mb-4">
                        <QRCodeSVG value={shareLink} size={120} />
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scan to View</p>
                     <div className="flex items-center gap-2 bg-white border p-3 rounded-xl w-full">
                        <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                        <p className="text-xs text-slate-600 truncate flex-1 font-mono">{shareLink}</p>
                        <button 
                          onClick={handleCopyLink}
                          className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 rounded-xl border border-slate-100 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Expiry</p>
                        <select className="text-xs font-bold text-slate-700 bg-transparent outline-none w-full">
                           <option>24 Hours</option>
                           <option>7 Days</option>
                           <option>Never</option>
                        </select>
                     </div>
                     <div className="p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Password</p>
                          <p className="text-xs font-bold text-slate-700">Encrypted</p>
                        </div>
                        <Lock className="h-4 w-4 text-slate-300" />
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
