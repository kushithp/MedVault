import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  File, 
  X, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  AlertCircle,
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileWithStatus {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error';
  progress: number;
  error?: string;
  type: string;
}

interface DragDropUploaderProps {
  onUploadComplete: (files: File[]) => void;
  isProcessing?: boolean;
}

export const DragDropZone: React.FC<DragDropUploaderProps> = ({ onUploadComplete, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File) => {
    const validTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/jpg', 
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const maxSize = 15 * 1024 * 1024; // 15MB

    if (!validTypes.includes(file.type)) return "Unsupported file type";
    if (file.size > maxSize) return "File too large (max 10MB)";
    return null;
  };

  const processFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validatedFiles = fileArray.map(file => {
      const error = validateFile(file);
      return {
        file,
        id: Math.random().toString(36).substring(7),
        status: error ? 'error' as const : 'pending' as const,
        progress: 0,
        error: error || undefined,
        type: file.type
      };
    });

    setFiles(prev => [...prev, ...validatedFiles]);
    
    // Auto-trigger upload for valid pending files
    const validFiles = validatedFiles.filter(f => !f.error).map(f => f.file);
    if (validFiles.length > 0) {
      onUploadComplete(validFiles);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] overflow-hidden group cursor-pointer",
          isDragging 
            ? "border-[#2563EB] bg-[#EFF6FF] scale-[0.99] shadow-inner" 
            : "border-[#E2E8F0] bg-white hover:border-[#2563EB] hover:bg-slate-50/50"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <AnimatePresence>
            {isDragging && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.05 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#2563EB]"
              />
            )}
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={cn(
            "h-20 w-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500",
            isDragging ? "bg-[#2563EB] text-white scale-110 shadow-lg rotate-12" : "bg-[#F1F5F9] text-[#2563EB]"
          )}>
            <Upload className={cn("h-10 w-10", isDragging && "animate-bounce")} />
          </div>
          
          <h3 className="text-xl font-bold text-[#1E293B] mb-2">
            {isDragging ? "Drop your reports here" : "Drag & Drop Medical Reports"}
          </h3>
          <p className="text-[#64748B] text-sm max-w-xs mb-8 font-medium">
            Support for MRI, CT Scans, X-rays, and Lab Results (PDF, PNG, JPG)
          </p>

          <input
            type="file"
            multiple
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => e.target.files && processFiles(e.target.files)}
          />

          <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 rounded-xl font-bold h-12 shadow-sm transition-all group-hover:scale-105 active:scale-95">
            Select Files From Computer
          </Button>
        </div>

        {/* Success Confetti Effect (Conceptual) */}
        {isProcessing && (
          <div className="absolute bottom-4 right-4">
             <div className="flex items-center gap-2 bg-[#10B981] text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                <Zap className="h-3 w-3" /> Processing with Gemini
             </div>
          </div>
        )}
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid gap-3 max-h-[300px] overflow-y-auto thin-scrollbar pr-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-4 group shadow-sm hover:border-[#2563EB] transition-all"
              >
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                  file.error ? "bg-rose-50 text-rose-500" : "bg-[#F8FAFC] text-[#2563EB]"
                )}>
                  {file.error ? <AlertCircle /> : <FileText />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-[#1E293B] truncate">{file.file.name}</p>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="text-[#94A3B8] hover:text-rose-500 transition-colors p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {file.error ? (
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">{file.error}</p>
                  ) : (
                    <div className="space-y-2">
                       <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                          <span>{(file.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          {isProcessing ? (
                             <span className="flex items-center text-[#2563EB]">
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Analyzing...
                             </span>
                          ) : (
                             <span className="text-[#10B981] flex items-center">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Ready
                             </span>
                          )}
                       </div>
                       {isProcessing && (
                         <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                           <motion.div 
                              className="h-full bg-[#2563EB]" 
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 5, ease: "easeInOut" }}
                           />
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Button = ({ children, className, ...props }: any) => (
  <button className={cn("px-4 py-2 transition-all", className)} {...props}>
    {children}
  </button>
);
