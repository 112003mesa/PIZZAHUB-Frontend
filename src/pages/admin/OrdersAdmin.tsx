import React, { useState, useEffect, useMemo } from "react";
import { 
  FiPackage, FiTruck, FiCheckCircle, FiClock, 
  FiSearch, FiEye, FiMoreVertical, FiDownload 
} from "react-icons/fi";
import type { LatestOrder } from "../../type";
import api from "../../api/axios";
import Loading3D from "../../components/Loading3D.tsx";

// --- Components الصغير لضمان Clean Code ---
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    on_the_way: "bg-blue-100 text-blue-700 border-blue-200",
    accepted: "bg-indigo-100 text-indigo-700 border-indigo-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-tighter ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const OrdersAdmin: React.FC = () => {
  const [orders, setOrders] = useState<LatestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // تم تعديل المسار ليتوافق مع الـ Base URL الموجود في الـ axios instance
        const response = await api.get("/orders"); 
        setOrders(response.data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // تحسين الأداء باستخدام useMemo للفلترة
  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  // حساب الإحصائيات ديناميكياً
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    inTransit: orders.filter(o => o.status === "on_the_way").length,
    completed: orders.filter(o => o.status === "delivered").length,
  };


  return loading ? (<div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center"><Loading3D /></div>) : (
    <div className="space-y-8 animate-fadeIn p-6 bg-slate-50/50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track customer pizza orders in real-time.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all font-semibold text-sm">
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FiPackage />} label="Total Orders" value={stats.total} color="indigo" />
        <StatCard icon={<FiClock />} label="Pending" value={stats.pending} color="amber" />
        <StatCard icon={<FiTruck />} label="In Transit" value={stats.inTransit} color="blue" />
        <StatCard icon={<FiCheckCircle />} label="Completed" value={stats.completed} color="emerald" />
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID or Customer name..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                        {order.user?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{order.user?.name || "Deleted User"}</p>
                        <p className="text-xs text-slate-500">{order.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {order.items?.length || 0} Items
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">${order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 shadow-sm transition-all">
                        <FiEye size={16} />
                      </button>
                      <button className="p-2 hover:bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                        <FiMoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-10 text-center text-slate-400">No orders found matching your search.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- StatCard Component ---
const StatCard = ({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:translate-y-[-2px]">
      <div className={`p-3 rounded-xl text-xl ${colorMap[color]}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-slate-900 mt-0.5">{value.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default OrdersAdmin;