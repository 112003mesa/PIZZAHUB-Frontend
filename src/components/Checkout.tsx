import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toggleCheckout, clearCart, removeFromCart } from "../redux/cartSlice";
import { formatPrice } from "./Formatters";
import { IoClose, IoTrash, IoCard, IoCash, IoBagCheckOutline, IoLocationSharp } from "react-icons/io5";
import toast from "react-hot-toast";
import type { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../redux/hooks";
import api from "../api/axios";

// إصلاح أيقونة ماركر Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const Checkout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // بيانات السلة من Redux
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<[number, number]>([30.0444, 31.2357]); 
  const [formData, setFormData] = useState({
    address: "",
    paymentMethod: "cash" as "cash" | "card",
  });

  // مكوّن النقر على الخريطة
  const LocationMarker = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        await fetchAddress(lat, lng);
      },
    });
    return <Marker position={position} />;
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setFormData((prev) => ({ ...prev, address: data.display_name }));
    } catch (error) {
      console.error("Geocoding error", error);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        fetchAddress(latitude, longitude);
      },
      () => console.log("Location access denied")
    );
  }, []);

  // دالة إرسال الطلب (المصححة)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("سلتك فارغة");
    if (!formData.address) return toast.error("برجاء تحديد عنوان التوصيل");

    setLoading(true);
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          size: item.selectedSize?.name, // لو الباك اند بيقبل سترنج خليه كده، لو بيقبل اوبجكت ابعت item.selectedSize
          
          // التعديل هنا: نرسل الاوبجكت الكامل للإضافات وليس الاسم فقط
          extras: item.selectedExtras.map(ex => ({
            name: ex.name,
            price: ex.price
          })), 
          
          totalPrice: item.totalPrice
        })),
        paymentMethod: formData.paymentMethod,
        address: formData.address,
        location: { lat: position[0], lng: position[1] },
        subtotal: cartTotal,
        deliveryFee: 0, 
        totalAmount: cartTotal,
      };

      const response = await api.post('/orders/create', orderPayload);
      
      if (response.status === 201 || response.status === 200) {
        toast.success('تم تسجيل طلبك بنجاح! 🚀');
        dispatch(clearCart());
        dispatch(toggleCheckout(false));
        navigate('/my-orders');
      }
    } catch (err: any) {
      console.error("Server Error Details:", err.response?.data);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء تنفيذ الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end font-sans">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-all duration-500" 
           onClick={() => dispatch(toggleCheckout(false))} />

      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <IoBagCheckOutline className="text-primary" /> Checkout
            </h2>
            <p className="text-sm text-gray-400 font-medium">{cartItems.length} items in your bag</p>
          </div>
          <button onClick={() => dispatch(toggleCheckout(false))} className="p-2 hover:bg-red-50 rounded-full transition-all group">
            <IoClose size={28} className="text-gray-400 group-hover:text-red-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-10 custom-scrollbar pb-24">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-orange-50 text-primary rounded-full flex items-center justify-center animate-pulse">
                <IoBagCheckOutline size={40} />
              </div>
              <h3 className="text-lg font-bold">Your cart is empty</h3>
              <button onClick={() => { dispatch(toggleCheckout(false)); navigate("/menu"); }}
                      className="text-primary font-bold hover:underline">Explore Menu</button>
            </div>
          ) : (
            <>
              {/* 1. Review Items (أولاً) */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-l-4 border-primary pl-3">1. Review Items</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.cartId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                      <img src={item.image} className="w-16 h-16 rounded-xl object-cover" alt={item.name} />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm leading-tight">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-sm">{formatPrice(item.totalPrice)}</p>
                        <button onClick={() => dispatch(removeFromCart(item.cartId))} className="text-red-400 hover:text-red-600 p-1 transition-colors">
                          <IoTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Delivery & Map (ثانياً) */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-l-4 border-primary pl-3">2. Delivery Location</h3>
                
                {/* Map */}
                <div className="h-60 w-full rounded-3xl overflow-hidden border-4 border-gray-50 shadow-lg z-0 relative">
                   <div className="absolute top-3 left-3 z-[400] bg-white px-3 py-1 rounded-full shadow-md text-[10px] font-bold text-primary flex items-center gap-1">
                      <IoLocationSharp /> Select Spot
                   </div>
                  <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker />
                  </MapContainer>
                </div>

                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Delivery Address Details</label>
                    <textarea
                      required
                      placeholder="E.g. Street Name, Building No, Floor..."
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                      <PaymentOption 
                        active={formData.paymentMethod === 'cash'} 
                        onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                        icon={<IoCash size={22} />}
                        label="Cash"
                      />
                      <PaymentOption 
                        active={formData.paymentMethod === 'card'} 
                        onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                        icon={<IoCard size={22} />}
                        label="Card"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Footer Sticky */}
        {cartItems.length > 0 && (
          <div className="p-8 border-t bg-white shadow-[0_-15px_50px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex justify-between items-center font-black">
              <span className="text-gray-400 text-lg uppercase tracking-wider">Total</span>
              <span className="text-primary text-3xl">{formatPrice(cartTotal)}</span>
            </div>
            
            <button
              form="checkout-form"
              disabled={loading}
              className={`w-full py-5 rounded-3xl text-white font-black text-lg shadow-xl shadow-primary/40 transition-all flex justify-center items-center gap-3 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-orange-600 active:scale-95"
              }`}
              type="submit"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                `Confirm & Place Order`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentOption = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
      active ? "border-primary bg-orange-50 text-primary" : "border-gray-100 text-gray-400 hover:border-gray-100 shadow-sm"
    }`}
  >
    {icon}
    <span className="font-bold text-xs uppercase">{label}</span>
  </button>
);

export default Checkout;