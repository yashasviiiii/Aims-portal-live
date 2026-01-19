import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { verifyOtp } from "../../api/auth";
import toast from "react-hot-toast";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
  // basic validation
  if (otp.join("").length !== 6) {
    toast.error("Please enter the 6-digit OTP");
    return;
  }

  const toastId = toast.loading("Verifying OTP...");

  try {
    await verifyOtp({
      email: state.email,
      otp: otp.join(""),
    });

    toast.success("OTP verified successfully", { id: toastId });
    navigate("/");
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Invalid or expired OTP",
      { id: toastId }
    );
  }
};


  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/iitrpr.jpg')" }}
    >
      {/* Glass Card */}
      <div className="bg-white/20 backdrop-blur-lg border border-white/30 w-full max-w-md rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Verify OTP
        </h2>

        {/* OTP Boxes */}
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              className="w-12 h-12 text-center text-lg font-semibold rounded-lg
                         bg-white/80 focus:outline-none
                         focus:ring-2 focus:ring-gray-800"
            />
          ))}
        </div>

      <button
        onClick={handleVerify}
        disabled={otp.join("").length !== 6}
        className="w-full bg-black text-white py-2 rounded-lg transition font-semibold
                  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Verify
      </button>

      </div>
    </div>
  );
}
