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
  Heart
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const data = [
  { name: "Jan", bp: 120, sugar: 95, weight: 72 },
  { name: "Feb", bp: 122, sugar: 98, weight: 71.5 },
  { name: "Mar", bp: 118, sugar: 92, weight: 71 },
  { name: "Apr", bp: 121, sugar: 94, weight: 70.8 },
  { name: "May", bp: 119, sugar: 90, weight: 70.5 },
];

export default function Analytics() {
  return (
    <div className="p-8 space-y-8 bg-slate-50/30 h-full overflow-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Analytics</h1>
        <p className="text-slate-500">Track your health trends and biometrics over time.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Blood Pressure", value: "119/80", unit: "mmHg", icon: Heart, trend: "-2%", color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Blood Sugar", value: "90", unit: "mg/dL", icon: Droplets, trend: "-5%", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Body Weight", value: "70.5", unit: "kg", icon: Scale, trend: "-1.2kg", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pulse Rate", value: "72", unit: "bpm", icon: Activity, trend: "Normal", color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((item) => (
          <Card key={item.label} className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <div className={`${item.bg} p-2 rounded-lg`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <span className="text-2xl font-bold">{item.value}</span>
                <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
              </div>
              <p className="text-xs font-medium text-emerald-600 mt-2">
                <TrendingUp className="inline h-3 w-3 mr-1" /> {item.trend} compared to last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="vitals" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl">
          <TabsTrigger value="vitals" className="rounded-lg">Vitals Tracking</TabsTrigger>
          <TabsTrigger value="weight" className="rounded-lg">Weight History</TabsTrigger>
          <TabsTrigger value="sugar" className="rounded-lg">Sugar Levels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vitals">
          <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <CardHeader>
              <CardTitle>Blood Pressure & Health Vitals</CardTitle>
              <CardDescription>Visualizing your health metrics over the past 5 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] w-full pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bp" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorBp)" 
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
