import { useState } from "react";
import { authApi} from "../services/authAPI";
import { useNavigate } from "react-router-dom";
import Otp from "../components/Otp";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await authApi.registerUser({
        ...form,
        isEmailVerified,
      });

      // localStorage.setItem("user", JSON.stringify(res.data.user._id));
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/chat");

    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 to-slate-200">
      <div className="bg-white rounded-2xl shadow-xl w-[360px] p-6">

        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Create Account
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Join the digital sanctuary and elevate your flow.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">

          <div>
            <label className="text-xs text-gray-500">Email Address</label>

            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  disabled={isVerifying || isEmailVerified}
                  className="w-full bg-transparent outline-none text-sm"
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <button
                type="button"
                disabled={!form.email || isVerifying || isEmailVerified}
                onClick={async () => {
                  try {
                    setIsVerifying(true);

                    const res = await authApi.sendOtp(form.email);

                    console.log(res.data.message);

                    setShowOtpModal(true);

                  } catch (error: any) {
                    console.error(error.response?.data?.message || error.message);
                    setShowOtpModal(false);
                  } finally {
                    setIsVerifying(false);
                  }
                }}
                className={`px-3 py-2 text-xs rounded-lg whitespace-nowrap ${isEmailVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                  }`}
              >
                {isEmailVerified ? "Verified" : isVerifying ? "..." : "Verify"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Full Name</label>
            <div className="flex items-center border rounded-lg px-3 py-2 mt-1 bg-gray-50">
              <input
                type="text"
                placeholder="John Doe"
                required
                className="w-full bg-transparent outline-none text-sm"
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Password</label>
            <div className="flex items-center border rounded-lg px-3 py-2 mt-1 bg-gray-50">
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-transparent outline-none text-sm"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isEmailVerified || loading}
            className={`w-full py-2 rounded-lg text-white font-medium ${!isEmailVerified
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700 shadow-md"
              }`}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>

          <div className="text-center text-xs text-gray-400 mt-2">
            Or continue with
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                window.location.href = "http://localhost:4500/auth/google";
              }}
              className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-100"
            >
              Google
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-3">
            Already have an account?{" "}
            <span
              className="text-teal-600 cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Sign In
            </span>
          </p>

        </form>
      </div>
      {showOtpModal && (
        <Otp
          email={form.email}
          onClose={() => setShowOtpModal(false)}
          onVerified={() => {
            setIsEmailVerified(true);
            setShowOtpModal(false);
          }}
        />
      )}
    </div>
  );
}