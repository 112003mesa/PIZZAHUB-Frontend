import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout } from "../redux/authSlice";
import { LiaTimesSolid } from "react-icons/lia";
import { FiLogOut, FiMenu, FiBell } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user, isAuthenticated, isSidebarOpen } = useAppSelector(
    (state) => state.authReducer
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  /* ================= LINKS BY ROLE ================= */
  const commonLinks = [{ name: "Home", path: "/", id: 1 }];
  const userLinks = [
    { name: "Menu", path: "/menu", id: 2 },
    { name: "My Orders", path: "/orders", id: 3 },
    { name: "Cart", path: "/cart", id: 4 },
  ];
  const deliveryLinks = [
    { name: "Dashboard", path: "/delivery/dashboard", id: 5 },
    { name: "Orders", path: "/delivery/orders", id: 5 },
    { name: "Map", path: "/delivery/map", id: 6 },
  ];
  const adminLinks = [
    { name: "dashboard", path: "/admin/dashboard", id: 9 },
    { name: "delivery", path: "/admin/delivery", id: 9 },
    { name: "Orders", path: "/admin/orders", id: 10 },
    { name: "Products", path: "/admin/products", id: 11 },
  ];

  const getLinksByRole = () => {
    if (!isAuthenticated || !user) return commonLinks;
    switch (user.role) {
      case "admin": return adminLinks;
      case "delivery": return deliveryLinks;
      default: return [...commonLinks, ...userLinks];
    }
  };

  const links = getLinksByRole();

  /* ================= ACTIONS ================= */
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/logout`);
      dispatch(logout());
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error: any) {
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 right-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300 
      ${isAuthenticated && user?.role === 'admin' 
        ? (isSidebarOpen ? "lg:left-64 left-0" : "lg:left-20 left-0") 
        : "left-0"}`}
    >
      <div className="px-4 md:px-8 h-full flex items-center justify-between">
        
        {/* Left Side: Brand/Logo */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xl font-black text-indigo-600 flex items-center gap-2">
            <span className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg shadow-indigo-200">🍕</span>
            <span className="hidden sm:inline-block tracking-tight text-gray-900">PIZZA<span className="text-indigo-600">HUB</span></span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center bg-gray-50 px-2 py-1.5 rounded-2xl border border-gray-100">
          {links.map((link, index) => (
            <Link
              key={link.id + index}
              to={link.path}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-300
                ${isActive(link.path) 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Icon (Visual Only) */}
              <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors relative">
                <FiBell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

              {/* User Info */}
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">{user?.role}</p>
                </div>
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 text-gray-600 bg-gray-100 rounded-lg"
          >
            <FiMenu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-white/80 backdrop-blur-md transition-all duration-500 ease-in-out p-6 lg:hidden
          ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-3xl font-extrabold text-indigo-600 tracking-wider">MENU</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-3 bg-white shadow-md rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-300"
          >
            <LiaTimesSolid size={28} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-5 text-center">
          {links.map((link, idx) => (
            <Link
              key={link.id + idx}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`py-4 text-xl font-semibold rounded-3xl transition-all duration-300 transform hover:scale-105
                ${isActive(link.path)
                  ? "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 shadow-inner"
                  : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"}`}
              style={{ transitionDelay: `${idx * 50}ms` }} // تأخير بسيط لكل رابط
            >
              {link.name}
            </Link>
          ))}

          <div className="h-[1px] bg-gray-200 my-6"></div>

          {/* Authentication Buttons */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 w-full py-4 text-xl font-bold text-red-600 bg-red-50 rounded-3xl shadow-md hover:scale-105 transform transition-all duration-300"
            >
              <FiLogOut /> Logout
            </button>
          ) : (
            <div className="flex flex-col gap-4 mt-6">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="py-4 text-xl font-semibold text-gray-900 bg-gray-100 rounded-3xl shadow-sm hover:shadow-md hover:bg-gray-200 transition-all duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="py-4 text-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-3xl shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>

    </header>
  );
};

export default Navbar;