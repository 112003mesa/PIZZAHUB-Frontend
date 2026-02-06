import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Bike,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { DashboardResponse } from "../../type";
import Loading3D from "../../components/Loading3D.tsx";

/* ------------------------------- Component ------------------------------- */

const DeliveryDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/delivery/dashboard/stats");
      setDashboard(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
    <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center">
      <Loading3D />
    </div>
    );
  }

  const chartData = dashboard?.weeklyStats?.map((stat) => ({
    name: stat._id || "",
    orders: stat.orders || 0,
    income: stat.income || 0,
  })) || [];

  // 2. تجهيز بيانات الـ Pie مع حماية من الـ NaN
  const deliveredRate = Number(dashboard?.orders?.deliveryCompletionRate) || 0;
  const canceledRate = Number(dashboard?.orders?.orderCancelRate) || 0;
  const pendingRate = Math.max(0, 100 - (deliveredRate + canceledRate));

  const pieData = [
    { name: "Delivered", value: deliveredRate, color: "#10B981" },
    { name: "Canceled", value: canceledRate, color: "#EF4444" },
    { name: "Pending", value: pendingRate, color: "#F59E0B" },
  ];

//

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="ltr">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bike className="text-orange-500" size={32} />
            Captain Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, here’s your performance summary.
          </p>
        </div>

        <div className="mt-4 md:mt-0 bg-white p-2 rounded-lg shadow-sm flex items-center gap-3 px-4">
          <div className="bg-orange-100 p-2 rounded-full text-orange-600">
            <Calendar size={20} />
          </div>
          <span className="text-gray-700 font-medium">
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Orders"
          value={dashboard?.orders?.todayCount ?? 0}
          icon={<Bike size={24} />}
          trend={`${dashboard?.orders?.percentage ?? 0}%`}
          color="blue"
        />
        <StatCard
          title="Today's Earnings"
          value={`${dashboard?.earnings?.today ?? 0} EGP`}
          icon={<DollarSign size={24} />}
          trend={`${dashboard?.earnings?.percentage ?? 0}% of Month`}
          color="green"
        />
        <StatCard
          title="Avg Delivery Time"
          value={`${dashboard?.orders?.avgDeliveryTime ?? 0} min`}
          icon={<Clock size={24} />}
          trend="Today"
          color="orange"
        />
        <StatCard
          title="Completion Rate"
          value={`${deliveredRate}%`}
          icon={<CheckCircle size={24} />}
          trend="All Time"
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-500" />
            Weekly Performance Analysis 
          </h3>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.length > 0 ? chartData : [{name: 'No Data', orders: 0, income: 0}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  dy={10}
                  tickFormatter={(val) => val.slice(5)} // Show MM-DD only
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income (EGP)"
                  stroke="#F97316"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#F97316", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Delivery Rate</h3>
          <p className="text-sm text-gray-500 mb-6">
            Overall successful delivery percentage 
          </p>

          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-3xl font-bold text-gray-800">
                {Math.round(deliveredRate)}%
              </span>
              <p className="text-xs text-gray-500">Success</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {pieData.map((item, idx) => (
              <div key={idx + item.name} className="flex items-center gap-1 text-xs text-gray-600">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Today's Orders</h3>
        </div>

        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="py-4 px-6 font-medium">Order ID</th>
                <th className="py-4 px-6 font-medium">Customer</th>
                <th className="py-4 px-6 font-medium">Address</th>
                <th className="py-4 px-6 font-medium">Amount</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboard?.orders.todayOrders && dashboard.orders.todayOrders.length > 0 ? (
                dashboard.orders.todayOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-800">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {order.user?.name || "Unknown User"}
                    </td>

                    <td className="py-4 px-6 text-gray-600 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="truncate max-w-[200px]" title={order.user?.address || order.address}>
                         {/* بنعرض عنوان اليوزر أو عنوان الأوردر لو موجود */}
                        {order.user?.address || order.address || "Local Address"}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-800">
                      {order.totalAmount} EGP
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No orders for today yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------- Components ----------------------------- */

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  color: "blue" | "green" | "orange" | "purple";
};

const StatCard = ({ title, value, icon, trend, color }: StatCardProps) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {trend}
        </span>
      </div>
      <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
      <span className="text-2xl font-bold text-gray-800">{value}</span>
    </div>
  );
};

type StatusBadgeProps = {
  status: string;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Mapping Backend Status to Colors
  const styles: Record<string, string> = {
    delivered: "bg-green-100 text-green-700 border-green-200",
    accepted: "bg-blue-100 text-blue-700 border-blue-200",
    on_the_way: "bg-indigo-100 text-indigo-700 border-indigo-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  
  // Format text (e.g., "on_the_way" -> "On The Way")
  const formatStatus = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default DeliveryDashboard;