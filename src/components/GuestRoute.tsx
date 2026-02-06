import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";

interface Props {
  children: React.ReactNode;
}

export default function GuestRoute({ children }: Props) {
  const { user, isAuthenticated } = useAppSelector((state) => state.authReducer);

  if (user && isAuthenticated) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "delivery") return <Navigate to="/delivery/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}