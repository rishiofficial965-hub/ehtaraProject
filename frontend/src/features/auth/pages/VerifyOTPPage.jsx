import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../products/components/Nav";
import Loader from "../components/Loader";
import { useAuth } from "../hook/useAuth.js";

const VerifyOTPPage = () => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { handleVerifyOTP, handleResendOTP, loading, pendingUserId } = useAuth();

  // If no pending userId exists, redirect back to register
  useEffect(() => {
    if (!pendingUserId) {
      navigate("/register");
    }
  }, [pendingUserId, navigate]);

  // Countdown timer for Resend OTP cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits allowed
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1); // Take last char (handles paste edge case)
    setDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setDigits(newDigits);
    // Focus the last filled or next empty cell
    const nextEmpty = newDigits.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }

    const result = await handleVerifyOTP({ userId: pendingUserId, otp });

    if (!result.success) {
      setError(result.error || "Verification failed. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      return; // stop here — do not try to access result.user on failure
    }

    const redirectPath =
      result.user.role === "buyer" ? "/" : "/seller/dashboard";

    navigate(redirectPath);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setSuccessMsg("");

    const result = await handleResendOTP({ userId: pendingUserId });

    if (result.success) {
      setSuccessMsg("A new OTP has been sent to your email.");
      setResendCooldown(60); // 60-second cooldown
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || "Failed to resend OTP.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-desert-khaki/30 flex flex-col">
      <Nav />
      <main className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md bg-white border border-lacquered-licorice/10 rounded-2xl px-8 py-10 shadow-sm">

          {/* Logo + Header */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-copper-green flex items-center justify-center mb-1 shadow-[0_5px_15px_rgba(63,78,60,0.2)]">
              <span className="text-albescent-white font-black text-2xl leading-none">S</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-lacquered-licorice">
              Verify your email
            </h1>
            <p className="text-lacquered-licorice/50 text-sm text-center leading-relaxed">
              We sent a 6-digit code to your email address.<br />
              Enter it below to activate your account.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="w-full bg-copper-green/10 border border-copper-green/20 rounded-xl px-4 py-3">
              <p className="text-copper-green text-sm text-center font-medium">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full">
            {/* 6-digit OTP Input Grid */}
            <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`
                  w-11 h-13 text-center text-xl font-bold rounded-xl
                  bg-copper-green/10 text-lacquered-licorice
                  border transition-all duration-200 outline-none
                  focus:ring-2 focus:ring-copper-green/40 focus:border-copper-green
                  caret-transparent select-none
                  ${digit ? "border-copper-green/60 bg-copper-green/15" : "border-copper-green/20"}
                `}
                  style={{ height: "52px" }}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || digits.join("").length < 6}
              className="w-full rounded-xl bg-copper-green text-albescent-white font-semibold py-3.5 hover:bg-lacquered-licorice transition-all active:scale-[0.98] cursor-pointer shadow-[0_4px_12px_rgba(63,78,60,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-albescent-white/40 border-t-albescent-white rounded-full animate-spin" />
                  Verifying…
                </span>
              ) : (
                "Verify & Continue"
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-lacquered-licorice/40 text-xs">Didn't receive a code?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className="text-copper-green text-sm font-semibold hover:underline underline-offset-4 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>

          {/* Expiry note */}
          <p className="text-lacquered-licorice/30 text-xs text-center">
            The code expires in 5 minutes.
          </p>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex gap-4 text-[11px] text-lacquered-licorice/30 font-medium tracking-wide">
          <span>Terms of use</span>
          <span className="w-1 h-1 bg-lacquered-licorice/20 rounded-full mt-1.5" />
          <span>Privacy policy</span>
        </div>
      </main>
    </div>
  );
};

export default VerifyOTPPage;
