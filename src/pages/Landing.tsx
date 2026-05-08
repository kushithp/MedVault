import * as React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Stethoscope, FileText, Activity, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/src/lib/firebase";

export default function Landing() {
  return (
    <div className="h-screen bg-slate-50 flex flex-col items-center overflow-y-auto custom-scrollbar p-6 py-12 md:py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl space-y-8"
      >
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <ShieldCheck className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Your Health, <span className="text-blue-600">Simplified</span> & Secured.
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The all-in-one platform to store medical reports, track prescriptions, and 
          get AI-powered insights into your health journey.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            onClick={signInWithGoogle} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-7 h-auto rounded-2xl shadow-xl shadow-blue-500/20"
          >
            <LogIn className="mr-2 h-5 w-5" /> Get Started with Google
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-7 h-auto rounded-2xl border-2">
            Learn More <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {[
            { icon: Stethoscope, title: "AI Analysis", desc: "Understand complex reports in plain English." },
            { icon: FileText, title: "Secure Vault", desc: "Encryption for all your medical documents." },
            { icon: Activity, title: "Health Insights", desc: "Track vitals and see trends over time." }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm"
            >
              <feature.icon className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <footer className="mt-20 text-slate-400 text-sm">
        &copy; 2024 MedVault AI. Production-Ready Digital Health Platform.
      </footer>
    </div>
  );
}
