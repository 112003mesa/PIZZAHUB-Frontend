import { useEffect, useState } from "react";
import { FaBoxOpen, FaMotorcycle, FaCheckCircle, FaClock, FaFire } from "react-icons/fa";
import { IoReceiptOutline } from "react-icons/io5";
import api from "../../api/axios";
import Loading3D from "../../components/Loading3D.tsx";
import { Link } from "react-router-dom";

// --- Interfaces for Type Safety ---
interface OrderItem {
  product: string; 
  quantity: number;
  totalPrice: number;
  extras: Array<{ name: string; price: number }>;
}

interface OrderData {
  _id: string;
  status: "pending" | "accepted" | "on_the_way" | "delivered" | "cancelled";
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

const Orders = () => {
  const [activeTab, setActiveTab] = useState<"Active" | "History">("Active");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fetch orders from API on mount
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/my");
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 3. Separate orders into "Active" and "Past" based on status
  const displayedOrders = orders.filter((order) => {
    if (activeTab === "Active") {
      return ["pending", "accepted", "on_the_way"].includes(order.status);
    }
    return ["delivered", "cancelled"].includes(order.status);
  });

  return (
    <section className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">My Orders</h1>
            <p className="text-gray-500 mt-1">Track your cravings or re-order your favorites.</p>
          </div>
          
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
            <button 
              onClick={() => setActiveTab("Active")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "Active" ? "bg-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Active Orders
            </button>
            <button 
              onClick={() => setActiveTab("History")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "History" ? "bg-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Past Orders
            </button>
          </div>
        </div>

        {/* 4. Handle Loading and Empty States */}
        <div className="space-y-6">
          {loading ? (
            // Loading State
            <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <Loading3D />
            </div>
          ) : displayedOrders.length > 0 ? (
            displayedOrders.map((order, index) => (
              <OrderCard key={order._id + index} order={order} />
            ))
          ) : (
            <EmptyState tab={activeTab} />
          )}
        </div>
      </div>
    </section>
  );
};

// --- Sub Components ---

const OrderCard = ({ order }: { order: OrderData }) => {
  const isPastOrder = ["delivered", "cancelled"].includes(order.status);

  // Format the date from the API (ISO String to Readable)
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-xl text-gray-400">
            <IoReceiptOutline />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg uppercase">#{order._id.slice(-6)}</h3>
            <span className="text-xs text-gray-400 font-medium">{orderDate}</span>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx + item.product} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-primary font-bold">
                    {item.quantity}x
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-700">Product: {item.product.slice(-5)}</p>
                  {item.extras.length > 0 && (
                      <p className="text-[10px] text-gray-400">Extras: {item.extras.map(e => e.name).join(", ")}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-800">${item.totalPrice}</span>
              </div>
            ))}
          </div>

          {!isPastOrder && <OrderProgress status={order.status} />}
        </div>
      </div>

      <div className="bg-gray-50 p-4 flex justify-between items-center">
         <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase">Total Amount</span>
            <span className="text-xl font-black text-gray-800">${order.totalAmount}</span>
         </div>
         
         <button className={`px-6 py-2 rounded-lg font-bold transition-all ${isPastOrder ? "text-primary hover:bg-white" : "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-orange-600"}`}>
            {isPastOrder ? "Re-Order" : "Track Order"}
         </button>
      </div>
    </div>
  );
};

// --- Helpers ---

const OrderProgress = ({ status }: { status: string }) => {
    // Logic for the progress bar width
    const getWidth = () => {
        if (status === "pending") return "10%";
        if (status === "accepted") return "50%";
        if (status === "on_the_way") return "85%";
        return "0%";
    }

    return (
        <div className="w-full md:w-5/12 bg-white p-4 rounded-xl border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Live Status</h4>
            <div className="relative flex justify-between items-center z-10">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
                <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-500" style={{ width: getWidth() }}></div>

                <Step icon={<FaClock />} active={["pending", "accepted", "on_the_way"].includes(status)} />
                <Step icon={<FaFire />} active={["accepted", "on_the_way"].includes(status)} />
                <Step icon={<FaMotorcycle />} active={status === "on_the_way"} />
                <Step icon={<FaCheckCircle />} />
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    delivered: "bg-green-100 text-green-600",
    accepted: "bg-orange-100 text-orange-600",
    pending: "bg-gray-100 text-gray-600",
    on_the_way: "bg-blue-100 text-blue-600",
    cancelled: "bg-red-100 text-red-600",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
};

const Step = ({ icon, active = false }: { icon: any; active?: boolean }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${active ? "bg-primary text-white" : "bg-gray-100 text-gray-300"}`}>
    {icon}
  </div>
);

const EmptyState = ({ tab }: { tab: string }) => (  
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="bg-gray-100 p-6 rounded-full text-gray-300 text-6xl mb-4">
      <FaBoxOpen />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">No {tab.toLowerCase()} orders found</h3>
    <p className="text-gray-500 max-w-xs mx-auto mb-6">Looks like you haven't placed any orders yet. Why not treat yourself?</p>
    <Link to="/menu" className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all">Browse Menu</Link>
  </div>
);

export default Orders;