import { useState, useRef } from "react";
import { authApi } from "../services/authAPI";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Verify({ email, onClose, onVerified }: any) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");

    try {
      const data = await authApi.verifyOtp(email, code);

      if (!data){
        toast.error("OTP send failed!");
        console.log("err on otp send")
      }

      onVerified();
      toast.success("OTP verified!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message||"Invalid OTP");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[360px] p-6 text-center">

        <h2 className="text-lg font-semibold text-gray-800">
          Security Verification
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Enter OTP sent to {email}
        </p>

        <div className="flex justify-between mb-5">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              ref={(el) => (inputs.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-10 h-10 text-center border rounded-lg"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-teal-600 text-white py-2 rounded-lg"
        >
          Verify Code
        </button>

        <button
          onClick={onClose}
          className="mt-3 text-sm text-gray-500"
        >
          Cancel
        </button>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}