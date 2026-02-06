import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { loginSuccess } from "../redux/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/login`,
        formData,
        { withCredentials: true }
      );

      const { accessToken, user } = res.data;

      dispatch(loginSuccess({ user, token: accessToken }));

      setLoading(false);
      toast.success("Logged in successfully!");

      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "delivery") navigate("/delivery/dashboard");
      else navigate("/");
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gradient-to-r from-indigo-50 to-white ">
      {/* Left Image */}
      <div className="hidden md:flex w-1/2 items-center justify-center p-10">
        <img
          className="rounded-2xl shadow-lg object-cover h-4/5"
          src="/image/slider_pizza_2.png"
          alt="leftSideImage"
        />
      </div>

      {/* Form Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 md:px-20 mt-44 md:mt-0">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-md flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Login
          </h2>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Welcome back! Please sign in to continue
          </p>

          {/* Email */}
          <div className="mt-6 w-full">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-12 px-5 rounded-full border border-gray-300 focus:border-indigo-400 outline-none placeholder-gray-400 transition"
              required
            />
          </div>

          {/* Password */}
          <div className="mt-4 w-full">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 px-5 rounded-full border border-gray-300 focus:border-indigo-400 outline-none placeholder-gray-400 transition"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full h-12 rounded-full text-white bg-indigo-500 hover:bg-indigo-600 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register Link */}
          <p className="text-gray-500 text-sm mt-5 text-center">
            Don’t have an account?{" "}
            <span
              className="text-indigo-500 hover:underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}