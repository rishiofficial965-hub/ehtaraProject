import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../../products/components/Nav";
import Loader from "../components/Loader";
import { useAuth } from "../hook/useAuth";

const ForgetPassword = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { handleResetPasswordOtp, loading, pendingUserId } = useAuth();

  // Redirect if no pending reset session
  useEffect(() => {
    if (!pendingUserId) {
      navigate("/login");
    }
  }, [pendingUserId, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!pendingUserId) {
      setError(
        "Session expired. Please request a new OTP from the login page.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    const result = await handleResetPasswordOtp({
      userId: pendingUserId,
      otp,
      newPassword,
      confirmPassword,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        const redirectPath =
          result.user?.role === "seller" ? "/seller/dashboard" : "/";
        navigate(redirectPath);
      }, 3000);
    } else {
      setError(result.error || "Failed to reset password. Please try again.");
    }
  }

  const inputClass =
    "w-full bg-desert-khaki/10 text-lacquered-licorice font-normal placeholder-lacquered-licorice/30 px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-copper-green border border-lacquered-licorice/10 transition-all";

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-desert-khaki/30 flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-md bg-white border border-lacquered-licorice/10 rounded-2xl px-8 py-10 shadow-sm">
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-14 h-14 rounded-xl bg-copper-green flex items-center justify-center mb-2 shadow-[0_5px_15px_rgba(63,78,60,0.15)]">
              <i className="ri-lock-password-line text-2xl text-albescent-white "></i>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-lacquered-licorice">
              Reset Password
            </h1>
          </div>

          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="w-full bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <p className="text-green-600 text-sm text-center font-medium">
                Password reset successfully! Redirecting to login...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-lacquered-licorice/60 uppercase tracking-widest ml-1">
                  Security Code
                </label>
                <input
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                  type="text"
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className={`${inputClass} text-center tracking-[0.5em] text-md font-bold font-mono`}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-lacquered-licorice/60 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <div className="relative w-full">
                  <input
                    onChange={(e) => setNewPassword(e.target.value)}
                    value={newPassword}
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    className={inputClass}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 cursor-pointer text-lacquered-licorice/30 hover:text-lacquered-licorice/60 transition"
                  >
                    <i
                      className={`ri-${showPassword ? "eye-line" : "eye-off-line"} text-lg`}
                    ></i>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-lacquered-licorice/60 uppercase tracking-widest ml-1">
                  Confirm Password
                </label>
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full rounded-xl bg-copper-green text-albescent-white font-semibold py-4 hover:bg-lacquered-licorice transition-all active:scale-[0.98] cursor-pointer mt-2 shadow-[0_4px_12px_rgba(63,78,60,0.2)] disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
              {loading ? "Resetting..." : "Update Password"}
            </button>
          </form>

          <Link
            to="/login"
            className="text-lacquered-licorice/50 text-sm font-medium hover:text-copper-green transition-colors mt-2"
          >
            Back to Login
          </Link>
        </div>

        <div className="absolute bottom-6 flex gap-4 text-[11px] text-lacquered-licorice/30 font-medium tracking-wide">
          <span>Secure Transaction</span>
          <span className="w-1 h-1 bg-lacquered-licorice/20 rounded-full mt-1.5"></span>
          <span>End-to-End Encrypted</span>
        </div>
      </main>
    </div>
  );
};

export default ForgetPassword;
