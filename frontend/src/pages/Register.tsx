import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await registerUser(form);
      localStorage.setItem("user", JSON.stringify(res.user._id));
      navigate("/chat");
    } catch (err) {
      alert("Registration failed");
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
          Create Account
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Join the digital sanctuary and elevate your flow.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <div className="flex items-center border rounded-lg px-3 py-2 mt-1">
              <input
                type="text"
                placeholder="John Doe"
                required
                className="w-full outline-none text-sm"
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Email Address</label>
            <div className="flex items-center border rounded-lg px-3 py-2 mt-1">
              <input
                type="email"
                placeholder="name@example.com"
                required
                className="w-full outline-none text-sm"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="flex items-center my-5">
          <hr className="flex-1" />
          <span className="px-2 text-gray-400 text-sm">
            Or continue with
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
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-teal-600 cursor-pointer font-medium"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}