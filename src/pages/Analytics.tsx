import * as React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Activity, 
  TrendingUp, 
  Droplets, 
  Scale, 
  Wind,
  Heart,
  Plus,
  History,
  AlertCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/src/store/authStore";
import { db } from "@/src/lib/firebase";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Analytics() {
  const { user } = useAuthStore();
  const [vitals, setVitals] = React.useState<any[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = React.useState(false);
  
  // Form State
  const [logType, setLogType] = React.useState("Blood Pressure");
  const [logValue, setLogValue] = React.useState("");
  const [logValue2, setLogValue2] = React.useState(""); // For diastolic in BP
  
  React.useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "users", user.uid, "biometrics"),
      orderBy("date", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVitals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleLogVital = async () => {
    if (!user || !logValue) return;
    
    try {
      const unit = logType === "Blood Pressure" ? "mmHg" : 
                   logType === "Blood Sugar" ? "mg/dL" : 
                   logType === "Weight" ? "kg" : "bpm";
                   
      await addDoc(collection(db, "users", user.uid, "biometrics"), {
        type: logType,
        value: parseFloat(logValue),
        value2: logValue2 ? parseFloat(logValue2) : null,
        unit,
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
        ownerId: user.uid
      });
      
      toast.success(`${logType} logged successfully`);
      setIsLogModalOpen(false);
      setLogValue("");
      setLogValue2("");
    } catch (error) {
      toast.error("Failed to log vital");
    }
  };

  const getChartData = (type: string) => {
    return vitals
      .filter(v => v.type === type)
      .map(v => ({
        name: format(new Date(v.date), "MMM dd"),
        value: v.value,
        value2: v.value2
      }));
  };

  const latestVitals = React.useMemo(() => {
    const latest: Record<string, any> = {};
    ["Blood Pressure", "Blood Sugar", "Weight", "Heart Rate"].forEach(type => {
      const filtered = vitals.filter(v => v.type === type);
      latest[type] = filtered[filtered.length - 1] || null;
    });
    return latest;
  }, [vitals]);

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <header className="glass-header h-16 flex items-center justify-between px-6 lg:px-8 shrink-0">
        <h1 className="text-xl font-bold text-[#1E293B]">Health Tracking</h1>
        <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl h-10 px-4 font-bold gap-2">
              <Plus className="h-4 w-4" /> Log Vital
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Log New Vital</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label>Metric Type</Label>
                <Select value={logType} onValueChange={setLogType}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blood Pressure">Blood Pressure</SelectItem>
                    <SelectItem value="Blood Sugar">Blood Sugar</SelectItem>
                    <SelectItem value="Weight">Weight</SelectItem>
                    <SelectItem value="Heart Rate">Heart Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{logType === "Blood Pressure" ? "Systolic" : "Value"}</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="rounded-xl h-11"
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                  />
                </div>
                {logType === "Blood Pressure" && (
                  <div className="space-y-2">
                    <Label>Diastolic</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="rounded-xl h-11"
                      value={logValue2}
                      onChange={(e) => setLogValue2(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleLogVital} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] h-11 rounded-xl font-bold">
                Save Reading
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <main className="scroll-container custom-scrollbar px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Analytics</h1>
          <p className="text-slate-500">Track your health trends and biometrics over time.</p>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Blood Pressure", key: "Blood Pressure", icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Blood Sugar", key: "Blood Sugar", icon: Droplets, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Body Weight", key: "Weight", icon: Scale, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pulse Rate", key: "Heart Rate", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((item) => {
          const vital = latestVitals[item.key];
          return (
            <Card key={item.label} className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <div className={`${item.bg} p-2 rounded-lg`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <span className="text-2xl font-bold">
                    {vital ? (vital.value2 ? `${vital.value}/${vital.value2}` : vital.value) : "--"}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">{vital?.unit || ""}</span>
                </div>
                {vital ? (
                  <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1">
                    <History className="h-3 w-3" /> Last logged {format(new Date(vital.date), "MMM dd")}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">No data point yet.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="vitals" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl">
          <TabsTrigger value="vitals" className="rounded-lg">Vitals History</TabsTrigger>
          <TabsTrigger value="weight" className="rounded-lg">Weight History</TabsTrigger>
          <TabsTrigger value="sugar" className="rounded-lg">Sugar Levels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vitals">
          <HealthChart data={getChartData("Blood Pressure")} title="Blood Pressure Trend" color="#e11d48" dataKey="value" />
        </TabsContent>
        <TabsContent value="weight">
          <HealthChart data={getChartData("Weight")} title="Weight Progression" color="#10b981" dataKey="value" />
        </TabsContent>
        <TabsContent value="sugar">
          <HealthChart data={getChartData("Blood Sugar")} title="Sugar Level Trend" color="#3b82f6" dataKey="value" />
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
}

function HealthChart({ data, title, color, dataKey }: any) {
  return (
    <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Visualizing your health metrics over time.</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] w-full pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <Tooltip 
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              cursor={{ stroke: color, strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill={`url(#color-${color})`} 
              activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
