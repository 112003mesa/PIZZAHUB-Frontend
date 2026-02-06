import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { FiBarChart2, FiUsers, FiShoppingBag, FiClock } from "react-icons/fi";
import { useAppSelector } from "../../redux/hooks";
import api from "../../api/axios";
import type { DashboardStats} from "../../type";
import Loading3D from "../../components/Loading3D.tsx";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

/* =====================
   Types & Helpers
===================== */
interface StatCardProps {
  title: string;
  value: string | number;
  percent: string;
  color: string;
  icon: React.ReactNode;
  isPositive?: boolean;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* =====================
   Sub-Components
===================== */
const StatCard: React.FC<StatCardProps> = ({ title, value, percent, color, icon, isPositive = true }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:shadow-md">
    <div>
      <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{title}</p>
      <h2 className="text-2xl font-black mt-1 text-slate-800">{value}</h2>
      <p className={`text-xs mt-2 font-bold ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
        {percent}
      </p>
    </div>
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shadow-lg shadow-current/20`}>
      {icon}
    </div>
  </div>
);

/* =====================
   Main Dashboard
===================== */
const Dashboard: React.FC = () => {
  const { token } = useAppSelector(state => state.authReducer);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Initial State
  const emptyStats: DashboardStats = {
    latestOrders: { day: [], week: [], month: [], threeMonths: [], sixMonths: [], year: [], all: [] },
    pendingOrders: { day: 0, week: 0, month: 0, threeMonths: 0, sixMonths: 0, year: 0, all: 0 },
    productsCount: { day: 0, week: 0, month: 0, threeMonths: 0, sixMonths: 0, year: 0, all: 0 },
    totalOrders: { day: 0, week: 0, month: 0, threeMonths: 0, sixMonths: 0, year: 0, all: 0 },
    usersCount: { day: 0, week: 0, month: 0, threeMonths: 0, sixMonths: 0, year: 0, all: 0 },
    charts: { revenueStats: [], ordersByStatus: [], dailyProfit: [] }
  };

  const [stats, setStats] = useState<DashboardStats>(emptyStats);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error: any) {
        if (error.response?.status === 401) navigate("/login");
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, navigate]);

  // --- Data Formatting using useMemo for Performance ---
  const revenueChartData = useMemo(() => 
    stats.charts?.revenueStats?.map(item => ({
      name: MONTHS[item._id - 1] || `M${item._id}`,
      sales: item.sales,
      revenue: item.revenue,
    })) || [], [stats.charts?.revenueStats]);

  const totalRevenue = useMemo(() => 
    revenueChartData.reduce((acc, curr) => acc + curr.revenue, 0), [revenueChartData]);

  const pieChartData = useMemo(() => 
    stats.charts?.ordersByStatus?.map((item, index) => ({
      name: item._id.replace("_", " "),
      value: item.value,
      color: COLORS[index % COLORS.length]
    })) || [], [stats.charts?.ordersByStatus]);

  const barChartData = useMemo(() => 
    stats.charts?.dailyProfit?.map(item => ({
      day: DAYS[item._id - 1] || item._id,
      value: item.value
    })) || [], [stats.charts?.dailyProfit]);

  if (loading) return <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center"><Loading3D /></div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-indigo-100 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-black mt-1">${totalRevenue.toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-white/20 rounded-full h-1.5">
                  <div className="bg-white h-1.5 rounded-full w-2/3" />
                </div>
                <span className="text-[10px] font-bold">65%</span>
              </div>
            </div>
            <FiBarChart2 className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
          </div>

          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders.all} 
            percent="+12.5% Inc" 
            color="bg-emerald-500" 
            icon={<FiShoppingBag size={20}/>} 
          />
          <StatCard 
            title="Active Users" 
            value={stats.usersCount.all} 
            percent="+5.2% New" 
            color="bg-blue-500" 
            icon={<FiUsers size={20}/>} 
          />
          <StatCard 
            title="Pending" 
            value={stats.pendingOrders.all} 
            percent="Action Required" 
            isPositive={false} 
            color="bg-amber-500" 
            icon={<FiClock size={20}/>} 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Growth</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} dot={{r: 4, fill: '#6366f1'}} activeDot={{r: 8}} name="Revenue ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Orders Status</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                    {pieChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transactions & Daily Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
              <Link to="/admin/orders" className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.latestOrders.all.slice(0, 5).map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">{order.user?.name || "Guest"}</span>
                          <span className="text-[10px] text-slate-400">{order.user?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">${order.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Daily Performance</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;