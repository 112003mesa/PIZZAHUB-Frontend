import { Outlet, Link, useLocation } from "react-router-dom";
import { FiHome, FiGrid, FiTable, FiMenu, FiChevronRight } from "react-icons/fi";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { toggleSidebar } from "../redux/authSlice";
import { MdDeliveryDining } from "react-icons/md";

/* ================= TYPES ================= */
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
  isOpen: boolean;
}

/* ================= SUB-COMPONENT ================= */
const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, path, active, isOpen }) => {
  return (
    <Link
      to={path}
      className={`relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group
        ${active 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
          : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
    >
      <div className={`text-xl shrink-0 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}>
        {icon}
      </div>
      
      <div className={`flex items-center justify-between flex-1 transition-opacity duration-300 
        ${isOpen ? "opacity-100 visible" : "opacity-0 invisible absolute"}`}>
        <span className="font-medium whitespace-nowrap">{label}</span>
        {active && <FiChevronRight className="ml-auto" />}
      </div>

      {/* Tooltip for collapsed state */}
      {!isOpen && (
        <div className="absolute left-16 bg-slate-900 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap z-50 shadow-xl border border-slate-700 text-xs translate-x-2 group-hover:translate-x-0 hidden lg:block">
          {label}
        </div>
      )}
    </Link>
  );
};

/* ================= MAIN LAYOUT ================= */
export default function Layout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isSidebarOpen, user } = useAppSelector((state) => state.authReducer);

  const adminMenuItems = [
    { icon: <FiHome />, label: "Dashboard", path: "/admin/dashboard" },
    { icon: <MdDeliveryDining />, label: "Delivery", path: "/admin/delivery" },
    { icon: <FiTable />, label: "Orders", path: "/admin/orders" },
    { icon: <FiGrid />, label: "Products", path: "/admin/products" },
  ];

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        {isAdmin && (
          <aside 
            className={`bg-[#0f172a] text-white hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out border-r border-slate-800
              ${isSidebarOpen ? "w-64" : "w-20"}`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800 shrink-0">
              <h1 className={`text-xl font-black text-white tracking-tighter transition-all duration-300 overflow-hidden
                ${isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                YNEX<span className="text-indigo-500">.</span>
              </h1>
              <button 
                onClick={() => dispatch(toggleSidebar())}
                className={`p-2 rounded-lg bg-slate-800 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all
                  ${!isSidebarOpen ? "mx-auto" : ""}`}
              >
                <FiMenu size={18} className={`${!isSidebarOpen && "rotate-180"} transition-transform duration-300`} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-3 space-y-2 mt-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
              {adminMenuItems.map((item) => (
                <SidebarItem 
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  active={location.pathname === item.path}
                  isOpen={isSidebarOpen}
                />
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300
          ${isAdmin ? (isSidebarOpen ? "lg:ml-64" : "lg:ml-20") : "ml-0"}`}>
          
          <main className="flex-1 p-4 md:p-8 mt-16 min-h-[calc(100vh-64px)]">
            <div className="max-w-full mx-auto animate-fadeIn">
              <Outlet />
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {/* Overlay for mobile (If you decide to make sidebar visible on mobile later) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 lg:hidden
          ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => dispatch(toggleSidebar())}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #1e293b transparent; }
      `}</style>
    </div>
  );
}