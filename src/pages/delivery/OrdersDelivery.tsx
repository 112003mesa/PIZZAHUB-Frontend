import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaMotorcycle, 
  FaMoneyBillWave, 
  FaClock, 
  FaCheckCircle, 
  FaPhoneAlt, 
  FaRoute,
} from 'react-icons/fa';
import { MdDeliveryDining, MdOutlinePendingActions } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../api/axios'; // تأكد من المسار
import type { Order } from '../../type';
import { useAppSelector } from '../../redux/hooks';
import Loading3D from '../../components/Loading3D.tsx';

// Helper to format time (e.g., "5 mins ago")
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

// --- Main Component ---

const OrdersDelivery = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'my_orders'>('available');
  const [loading, setLoading] = useState(false);

  const {user} = useAppSelector((state) => state.authReducer)

  // Fetch Orders based on active tab
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (activeTab === 'available') {
        endpoint = '/orders/delivery/available';
      } else {
        endpoint = '/delivery/my-deliveries';
      }
      
      const response = await api.get(endpoint);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle Accept
const handleAcceptOrder = async (id: string) => {
  try {
    await api.put(`/orders/delivery/accept/${id}`);
    toast.success('Order accepted successfully! 🚀');
    
    fetchOrders();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to accept order');
  }
};

  // Handle Complete/Deliver
  const handleCompleteOrder = async (id: string) => {
    try {
      await api.put(`/orders/delivery/status/${id}`, { status: 'delivered' });
      toast.success('Great job! Order delivered 💰');

      fetchOrders();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="ltr">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header */}
      <div className="bg-gradient-to-l from-orange-600 to-orange-500 text-white p-6 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaMotorcycle /> Captain {user?.name}
            </h1>
            <p className="text-orange-100 text-sm mt-1">Ready to break new records today?</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/30 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Online
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-6">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
          <button 
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2
              ${activeTab === 'available' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <MdOutlinePendingActions size={18} />
            New Orders
          </button>
          
          <button 
            onClick={() => setActiveTab('my_orders')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2
              ${activeTab === 'my_orders' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <MdDeliveryDining size={20} />
            My Deliveries
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-6 mt-6 space-y-4">
        {loading ? (
          <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <Loading3D />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FaMotorcycle className="mx-auto text-6xl mb-4 opacity-20" />
            <p>No {activeTab === 'available' ? 'new orders' : 'active deliveries'} at the moment</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard 
              key={order._id} 
              order={order} 
              isMyOrder={activeTab === 'my_orders'}
              onAccept={() => handleAcceptOrder(order._id)}
              onComplete={() => handleCompleteOrder(order._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// --- Card Component ---

interface OrderCardProps {
  order: Order;
  isMyOrder: boolean;
  onAccept: () => void;
  onComplete: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isMyOrder, onAccept, onComplete }) => {
  // توليد مسافة وهمية لأن جوجل مابس مش مربوط
  const mockDistance = React.useMemo(() => (Math.random() * 5 + 1).toFixed(1) + ' km', []);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 transition-transform hover:scale-[1.01]">
      
      <div className="flex justify-between items-center mb-4 border-b border-dashed border-gray-100 pb-3">
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase">
          #{order._id.slice(-6)}
        </span>
        <div className="flex items-center text-gray-400 text-xs gap-1">
          <FaClock />
          {timeAgo(order.createdAt)}
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="mt-1">
          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <FaMapMarkerAlt />
          </div>
        </div>
        <div className="w-full">
          <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
            {order.user?.name || "Unknown Customer"}
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
            {order.user?.address || "No address provided"}
          </p>
          
          {/* زر الاتصال يظهر فقط لو الأوردر بتاعي */}
          {isMyOrder && order.user?.phone && (
             <a href={`tel:${order.user.phone}`} className="mt-2 inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100">
               <FaPhoneAlt size={10} /> Call Customer
             </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
          <FaRoute className="text-blue-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400">Distance (Est.)</span>
            <span className="text-xs font-bold text-gray-700">{mockDistance}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
          <FaMoneyBillWave className="text-green-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400">Total ({order.paymentMethod})</span>
            <span className="text-xs font-bold text-gray-700">{order.totalAmount || 0} EGP</span>
          </div>
        </div>
      </div>

      {/* Items Summary */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600">
        <p className="font-bold mb-1">Order Details:</p>
        <div className="flex flex-wrap gap-1">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <span key={idx} className="bg-white px-2 py-1 rounded border border-gray-100">
                {item.quantity}x {item.name}
              </span>
            ))
          ) : (
            <span>No items details</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {isMyOrder ? (
        <div className="flex gap-2">
          <button 
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-green-200 transition-colors flex justify-center items-center gap-2"
            onClick={onComplete}
          >
            <FaCheckCircle /> Mark Delivered
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button 
            onClick={onAccept}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-orange-200 transition-colors flex justify-center items-center gap-2"
          >
            <FaMotorcycle /> Accept Order
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersDelivery;