import { useAppSelector } from "../redux/hooks";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const { isSidebarOpen, isAuthenticated, user } = useAppSelector((state) => state.authReducer);

  const getMarginClass = () => {
    if (isAuthenticated && user?.role === 'admin') {
      return isSidebarOpen ? "md:ml-64 ml-20" : "ml-20";
    }
    return "ml-0";
  };

  return (
    <footer 
      className={`mt-auto bg-white border-t border-slate-100 transition-all duration-500 ease-in-out ${getMarginClass()}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright Section */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
            <span>© {year}</span>
            <a
              href="#"
              className="text-slate-900 hover:text-indigo-600 font-bold transition-colors duration-300"
            >
              YNEX<span className="text-indigo-600">.</span>
            </a>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>

          {/* Credits Section */}
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span className="opacity-70">Designed with</span>
            <span className="text-red-500 animate-pulse text-xs">❤️</span>
            <span className="opacity-70">by</span>
            <a
              href="#"
              className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-500 transition-all"
            >
              YNEX Team
            </a>
          </div>

          {/* Links Section (Optional) */}
          <div className="flex items-center gap-6 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Help</a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;