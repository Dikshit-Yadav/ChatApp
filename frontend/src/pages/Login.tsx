import { useState } from "react";
import {authApi} from "../services/authAPI"
import { useNavigate } from "react-router-dom";
import { socket } from "../contex/socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setLoading(true);

    const res = await authApi.loginUser(form);

    localStorage.setItem("user", JSON.stringify(res.data.user));
    socket.connect();
    
    toast.success("Login successful!");
    navigate("/chat");
    
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="h-screen flex items-center justify-center bg-slate-200">
      <div className="bg-white rounded-2xl shadow-lg w-[380px] p-8">

        <div className="flex justify-center mb-4">
          <div className="bg-teal-500 p-3 rounded-xl text-white font-bold">
            ⚡
          </div>
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-800">
          Welcome Back
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Enter your details to access your dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Email Address</label>
            <div className="flex items-center border rounded-lg px-3 py-2 mt-1">
              <input
                type="email"
                placeholder="name@company.com"
                required
                className="w-full outline-none text-sm"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-600">
              <label>Password</label>
              <span
                className="text-teal-600 cursor-pointer"
                onClick={() => navigate("/forgetpassword")}
              >
                Forgot Password?
              </span>
            </div>

            <div className="flex items-center border rounded-lg px-3 py-2 mt-1">
              <input
                type="password"
                placeholder="********"
                required
                className="w-full outline-none text-sm"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center my-5">
          <hr className="flex-1" />
          <span className="px-2 text-gray-400 text-sm">
            OR CONTINUE WITH
          </span>
          <hr className="flex-1" />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              window.location.href = "http://localhost:4500/auth/google";
            }}
            className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-100"
          >
            Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-teal-600 cursor-pointer font-medium"
          >
            Sign Up
          </span>
        </p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}