import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { 
  IoAdd, IoRemove, 
  IoCard, IoCash, IoBagHandle, IoArrowForward,
  IoTrash, IoSearch, IoLocationSharp
} from 'react-icons/io5';

// Redux Imports
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { removeFromCart, updateQuantity, clearCart } from '../../redux/cartSlice'; // تأكد من المسار الصحيح

// Leaflet Setup
import 'leaflet/dist/leaflet.css';
import api from '../../api/axios';
import Loading3D from '../../components/Loading3D.tsx';
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const mapContainerStyle = { height: '100%', width: '100%' };
const defaultCenter: [number, number] = [30.0444, 31.2357];

// component لتغيير رؤية الخريطة
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
};

const Cart = () => {
  // --- Redux State ---
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  // --- Local State (UI Only) ---
  const [payment, setPayment] = useState<'card' | 'cash'>('card');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coords, setCoords] = useState<[number, number]>(defaultCenter);
  const [addressText, setAddressText] = useState('Select your location on map');

  // --- Calculations ---
  const subtotal = items.reduce((acc, i) => acc + i.totalPrice, 0);
  const fee = subtotal > 0 ? 3.00 : 0;
  const total = subtotal + fee;

  // --- Handlers ---
  const handleSearchAddress = async () => {
    if (!searchQuery) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      if (res.data.length > 0) {
        const { lat, lon, display_name } = res.data[0];
        setCoords([parseFloat(lat), parseFloat(lon)]);
        setAddressText(display_name);
      } else {
        toast.error('Location not found');
      }
    } catch (err) {
      toast.error('Search failed');
    }
  };

  const LocationPicker = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setCoords([lat, lng]);
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          setAddressText(res.data.display_name || 'Custom Location');
        } catch (err) {
          setAddressText(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        }
      },
    });
    return <Marker position={coords} icon={customIcon} />;
  };

  const submitOrder = async () => {
    if (items.length === 0) return toast.error('Your cart is empty');
    if (addressText === 'Select your location on map') return toast.error('Please pick a delivery spot');

    setLoading(true);
    try {
      const orderPayload = {
      items: items.map(i => ({
        product: i._id,
        quantity: i.quantity,
        totalPrice: i.totalPrice
      })),
      paymentMethod: payment,
      address: addressText,
      subtotal,
      deliveryFee: fee,
      totalAmount: total
      };

    if(payment === 'card') return toast.error('Payment method not supported yet');

      // مثال لإرسال البيانات للباك اند
    await api.post('/orders/create', orderPayload);
    toast.success('Order placed successfully! 🚀');
      dispatch(clearCart());
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return loading ? (<div className='fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center'><Loading3D /></div>) : (
    <div className="min-h-screen bg-[#F4F7F9] text-[#2D3436] pb-12 font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 p-4 rounded-[1.5rem] shadow-lg shadow-orange-200 text-white">
              <IoBagHandle size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Checkout</h1>
              <p className="text-slate-500 font-medium">Review your items and pinpoint delivery</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: Cart Items & Address */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Items Section */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="bg-slate-100 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Review Items
              </h2>
              
              <div className="space-y-4">
                {items.length > 0 ? items.map((item, index) => (
                  <div key={item.cartId + index} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-[2rem] bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 border border-transparent hover:border-orange-50 group">
                    <img src={item.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt={item.name} />
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-1">
                        {item.selectedSize && <span className="text-[10px] bg-white border px-2 py-0.5 rounded-full text-slate-500 font-bold uppercase">{item.selectedSize.name}</span>}
                        {item.selectedExtras.map(ex => (
                          <span key={ex.name} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">+{ex.name}</span>
                        ))}
                      </div>
                      <p className="text-orange-600 font-black mt-2">${item.unitPrice.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                      <button 
                        onClick={() => dispatch(updateQuantity({ cartId: item.cartId, delta: -1 }))}
                        className="text-slate-400 hover:text-orange-500 transition-colors"
                      >
                        <IoRemove size={18} />
                      </button>
                      <span className="font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => dispatch(updateQuantity({ cartId: item.cartId, delta: 1 }))}
                        className="text-slate-400 hover:text-orange-500 transition-colors"
                      >
                        <IoAdd size={18} />
                      </button>
                    </div>

                    <button 
                      onClick={() => dispatch(removeFromCart(item.cartId))}
                      className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                    >
                      <IoTrash size={22} />
                    </button>
                  </div>
                )) : (
                  <div className="py-10 text-center text-slate-400 font-medium">Your cart is feeling light... add some food! 🍕</div>
                )}
              </div>
            </div>

            {/* 2. Map Section */}
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="bg-slate-100 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Delivery Spot
              </h2>
              
              <div className="relative mb-6">
                <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
                  placeholder="Find your street, building or area..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-2xl py-5 pl-12 pr-24 outline-none transition-all font-semibold text-slate-700 shadow-inner"
                />
                <button 
                  onClick={handleSearchAddress}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-all font-bold text-sm shadow-lg"
                >
                  Search
                </button>
              </div>

              <div className="rounded-[2rem] overflow-hidden shadow-inner border border-slate-100 h-[400px] relative z-0">
                <MapContainer center={coords} zoom={13} style={mapContainerStyle}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <ChangeView center={coords} />
                  <LocationPicker />
                </MapContainer>
                
                {/* Floating Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white flex items-center gap-4">
                  <div className="bg-orange-500 p-3 rounded-xl text-white shadow-lg shadow-orange-200">
                    <IoLocationSharp size={24} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-orange-500 tracking-tighter">Deliver To</p>
                    <p className="font-bold text-slate-800 truncate text-sm">{addressText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar Summary */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Payment Methods */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black mb-6 text-slate-900">Payment</h3>
              <div className="space-y-3">
                {[
                  { id: 'card', icon: IoCard, label: 'Credit Card' },
                  { id: 'cash', icon: IoCash, label: 'Cash on Delivery' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id as any)}
                    className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${payment === m.id ? 'border-orange-500 bg-orange-50/30' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <m.icon size={26} className={payment === m.id ? 'text-orange-600' : 'text-slate-400'} />
                      <span className={`font-bold ${payment === m.id ? 'text-slate-900' : 'text-slate-400'}`}>{m.label}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${payment === m.id ? 'border-orange-500' : 'border-slate-300'}`}>
                      {payment === m.id && <div className="w-3 h-3 bg-orange-600 rounded-full animate-pulse" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Final Order Card */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[80px]" />
              
              <h3 className="text-2xl font-black mb-8 italic tracking-tight">Order Summary</h3>
              
              <div className="space-y-5 mb-10">
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-white text-sm">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  <span>Delivery Fee</span>
                  <span className="text-white text-sm">${fee.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-800 my-2" />
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-orange-500 font-black text-xs uppercase tracking-tighter">Total Payable</span>
                    <span className="text-4xl font-black tracking-tighter">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={submitOrder}
                disabled={loading || items.length === 0}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-600 text-white py-6 rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                {loading ? 'Processing...' : (
                  <>
                    Confirm Order <IoArrowForward className="mt-1" />
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-slate-500 text-center mt-6 font-bold uppercase tracking-widest opacity-50">
                Trusted & Secure Checkout
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;