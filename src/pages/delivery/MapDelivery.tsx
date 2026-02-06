import { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaArrowRight, FaMap } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../api/axios"; 
import Loading3D from "../../components/Loading3D.tsx";

const MapDelivery = () => {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get("/delivery/my-current-trip"); 
        setTrip(res.data);
        setLoading(false);
      } catch (err: any) {
        setError("No active trips found");
        setLoading(false);
      }
    };
    fetchTrip();
  }, []);

  useEffect(() => {
    if (!trip || loading) return;

    // 1. إزالة النسخة السابقة لتجنب تعليق الخريطة
    if (mapRef.current) {
      mapRef.current.remove(); 
      mapRef.current = null;
    }

    const mapContainer = document.getElementById("leaflet-map");
    if (!mapContainer) return;

    // 2. تحويل الإحداثيات إلى أرقام (ضروري جداً)
    const lat = Number(trip.customer.lat);
    const lng = Number(trip.customer.lng);

    // 3. إنشاء الخريطة - ملاحظة: إذا كان المكان غريب، بدل أماكن lat و lng هنا
    const map = L.map(mapContainer).setView([lat, lng], 15);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // 4. إضافة العلامة
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`<b>Destination</b><br/>${trip.customer.address}`)
      .openPopup();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [trip, loading]);

  const openInGoogleMaps = () => {
    if (!trip) return;
    // تم تصحيح الرابط ليعمل على المتصفح والتطبيق بدقة
    const url = `https://www.google.com/maps/dir/?api=1&destination=${trip.customer.lat},${trip.customer.lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  if (loading) return <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center"> <Loading3D /></div>;
  if (error) return <div className="flex h-screen justify-center items-center font-bold text-gray-600">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100" dir="ltr">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm z-20 flex justify-between items-center border-b">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FaArrowRight /></button>
          <div>
            <h2 className="font-bold text-gray-800 text-sm">Order #{trip.orderId.slice(-6)}</h2>
            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Customer: {trip.customer.name}</p>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative z-10">
        <div id="leaflet-map" className="absolute inset-0"></div>
      </div>

      {/* Bottom Control Panel */}
      <div className="bg-white rounded-t-[32px] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
            <FaMapMarkerAlt className="text-blue-600 text-xl" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Delivery Destination</p>
            <p className="text-sm font-bold text-gray-700 leading-snug">{trip.customer.address}</p>
          </div>
        </div>

        <button
          onClick={openInGoogleMaps}
          className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
        >
          <FaMap className="text-orange-400 text-lg" />
          Start GPS Navigation
        </button>
      </div>
    </div>
  );
};

export default MapDelivery;