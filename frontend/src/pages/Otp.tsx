import { useState, useRef } from "react";

export default function Verify() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (e: any, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = otp.join("");
    console.log("OTP:", code);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-200">
      <div className="bg-white rounded-2xl shadow-lg w-[380px] p-8 text-center">

        <div className="flex justify-center mb-4">
          <div className="bg-teal-100 p-4 rounded-full relative">
            <span className="text-2xl">✅</span>
            <span className="absolute bottom-0 right-0 text-xs bg-teal-600 text-white rounded-full px-1">
              🔒
            </span>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800">
          Security Verification
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the 6-digit code sent to your email to confirm your identity.
        </p>

        <div className="flex justify-between mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              ref={(el) => (inputs.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="w-12 h-12 text-center text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition"
        >
          Verify Code
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Didn’t receive the code?{" "}
          <span className="text-teal-600 cursor-pointer">
            Resend Code
          </span>{" "}
          <span className="text-gray-400">01:54</span>
        </p>
      </div>
    </div>
  );
}