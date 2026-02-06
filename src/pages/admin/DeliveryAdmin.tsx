import { useEffect, useState } from "react";
import { 
  Bike, User, Navigation, CheckCircle2, 
  Search, Filter, Clock, CreditCard, DollarSign 
} from "lucide-react";
import Loading3D from "../../components/Loading3D.tsx";
import api from "../../api/axios.ts";
import type { DeliveryUser } from "../../type/index.ts";
import { MdEmail } from "react-icons/md";


const DeliveryAdmin = () => {
  const [deliveries, setDeliveries] = useState<DeliveryUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDeliveries = async () => {
    try {
      const res = await api.get("/products/delivery-staff");
      setDeliveries(res.data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    // تحديث تلقائي كل 30 ثانية لضمان دقة البيانات الحية
    const interval = setInterval(fetchDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredDeliveries = deliveries.filter(pilot => 
    pilot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pilot.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return loading ? (
    <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center">
      <Loading3D />
    </div>
  ) : (
    <div className="p-8 bg-[#F8F9FD] min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/30">
              <Bike className="text-white w-8 h-8" />
            </div>
            FLEET <span className="text-primary">MONITOR</span>
          </h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-[0.3em] text-[10px]">Real-time Logistics Dashboard</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <StatCard label="Active Pilots" count={deliveries.length} color="bg-indigo-500" />
          <StatCard 
            label="On a Mission" 
            count={deliveries.filter(d => d.status === 'delivering').length} 
            color="bg-orange-500" 
          />
          <StatCard 
            label="Standby" 
            count={deliveries.filter(d => d.status === 'idle').length} 
            color="bg-emerald-500" 
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or mobile..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[1.5rem] outline-none focus:ring-2 ring-primary/10 border-none transition-all text-sm font-medium"
          />
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm hover:scale-105 transition-all active:scale-95 shadow-lg shadow-slate-200">
          <Filter size={18} /> Optimization
        </button>
      </div>

      {/* Grid of Delivery Pilots */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredDeliveries.map((pilot) => (
          <div 
            key={pilot._id} 
            className="bg-white rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group relative"
          >
            {/* Top Info */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                    <User size={30} />
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${pilot.status === 'idle' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 tracking-tight">{pilot.name}</h3>
                  <a href={`tel:${pilot.email}`} className="text-xs text-slate-400 flex items-center gap-1.5 font-bold mt-1 hover:text-primary transition-colors">
                    <MdEmail size={12} /> {pilot.email}
                  </a>
                </div>
              </div>
              <StatusBadge status={pilot.status} />
            </div>

            {/* Dynamic Content Section */}
            <div className="min-h-[140px]">
              {pilot.status === "delivering" && pilot.currentOrderId ? (
                <div className="bg-slate-50 rounded-[1.8rem] p-5 border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-tighter">
                      <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                      Live Delivery
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                      <Clock size={10} /> {new Date(pilot.currentOrderId.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                      <Navigation size={16} />
                    </div>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed line-clamp-2">
                      {pilot.currentOrderId.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-500" />
                      <span className="text-sm font-black text-slate-700">{pilot.currentOrderId.totalAmount} EGP</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <CreditCard size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{pilot.currentOrderId.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[140px] border-2 border-dashed border-slate-100 rounded-[1.8rem] flex flex-col items-center justify-center text-center p-6 transition-all group-hover:border-emerald-100 group-hover:bg-emerald-50/30">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500 mb-3 transition-transform group-hover:scale-110">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Available for orders</p>
                </div>
              )}
            </div>

            <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-[1.2rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-lg shadow-slate-100">
              Track Detailed Path
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Components
const StatusBadge = ({ status }: { status: "idle" | "delivering" }) => (
  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${
    status === "idle" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
  }`}>
    {status === "idle" ? "Idle" : "On Duty"}
  </div>
);

const StatCard = ({ label, count, color }: { label: string, count: number, color: string }) => (
  <div className="bg-white px-7 py-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start min-w-[130px] hover:scale-105 transition-transform">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      <p className="text-2xl font-black text-slate-800 tracking-tighter">{count}</p>
    </div>
  </div>
);

export default DeliveryAdmin;