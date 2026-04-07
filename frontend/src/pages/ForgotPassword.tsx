import { useState } from "react";
import Otp from "../components/Otp";
import { authApi } from "../services/authAPI";
import { useNavigate } from "react-router-dom";
export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [verified, setVerified] = useState(false);
   const handleSendOtp = async () => {
    try {
        setLoading(true);

        const res = await authApi.sendOtpForgot(email);

        alert(res.data.message);
        setShowOtp(true);

    } catch (err) {
        alert(err || "Something went wrong");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 to-slate-200">

            <div className="bg-white rounded-2xl shadow-xl w-[360px] p-6">

                <h2 className="text-2xl font-semibold text-center text-gray-800">
                    Forgot Your Password?
                </h2>

                <p className="text-sm text-gray-500 text-center mb-6">
                    Enter your email and we’ll send you a verification code.
                </p>

                <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    onClick={handleSendOtp}
                    disabled={!email || loading}
                    className="w-full bg-teal-600 text-white py-2 rounded-lg"
                >
                    {loading ? "Sending..." : "Send Verification Code"}
                </button>
            </div>

            {showOtp && (
                <Otp
                    email={email}
                    onClose={() => setShowOtp(false)}
                    onVerified={() => {
                        setVerified(true);
                        setShowOtp(false);
                        navigate("/reset-password", { state: { email } });
                    }}
                />
            )}
        </div>
    );
}