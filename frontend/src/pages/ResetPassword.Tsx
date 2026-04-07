import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../services/authAPI";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    const handleReset = async () => {
        try {
            const res = await authApi.resetPassword(email, password);

            const data = res.data;

            alert(data.message || "Password reset successful");
            navigate("/login");

        } catch (err: any) {
            alert(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 to-slate-200">

            <div className="bg-white rounded-2xl shadow-xl w-[360px] p-6">

                <h2 className="text-2xl font-semibold text-center text-gray-800">
                    Reset Your Password
                </h2>

                <p className="text-sm text-gray-500 text-center mb-6">
                    Enter a new password for your account.
                </p>

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleReset}
                    className="w-full bg-teal-600 text-white py-2 rounded-lg"
                >
                    Reset Password
                </button>

            </div>

        </div>
    );
}