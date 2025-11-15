import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { RainbowButton } from "../../components/ui/rainbow-button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Xử lý callback từ Google OAuth
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");
    const errorParam = params.get("error");

    if (authStatus === "success") {
      console.log("✅ Google sign up successful");
      setLoading(true);
      
      // Verify authentication
      verifyAuth();
      
      // Clean URL
      window.history.replaceState({}, document.title, "/signup");
    } else if (errorParam) {
      console.error("❌ Sign up error:", errorParam);
      setError(getErrorMessage(errorParam));
      
      // Clean URL
      window.history.replaceState({}, document.title, "/signup");
    }
  }, [navigate]);

  const verifyAuth = async () => {
    try {
      const BACKEND = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:5000";
      const response = await fetch(`${BACKEND}/api/auth/me`, {
        credentials: "include", // Gửi cookie
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ User registered and authenticated:", data.user);
        
        // Lưu user info vào localStorage (optional)
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect đến onboarding hoặc trang chính
        navigate("/home");
      } else {
        throw new Error("Authentication verification failed");
      }
    } catch (error) {
      console.error("❌ Verify auth error:", error);
      setError("Failed to verify authentication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      authentication_failed: "Sign up failed. Please try again.",
      token_creation_failed: "Failed to create account. Please try again.",
      no_email: "No email found in Google account.",
      user_exists: "An account with this email already exists.",
    };
    return errorMessages[errorCode] || "An unexpected error occurred.";
  };

  const handleGoogleLogin = () => {
    console.log('🔐 Starting "Continue with Google" process...');
    setError("");
    const BACKEND = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:5000";
    window.location.href = `${BACKEND}/api/auth/google`;
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Creating your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Animated Card */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 p-[0.8px] rounded-2xl bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 animate-border"
      >
        <div className="rounded-2xl p-8 flex flex-col items-center w-80 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-2">
            <BookOpen
              className="w-12 h-12 text-blue-600 mb-1"
              strokeWidth={1}
            />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Account
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-xs text-red-600 text-center">{error}</p>
            </motion.div>
          )}

          {/* Google Button */}
          <RainbowButton
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-full border border-gray-800 bg-black text-white py-2 text-sm font-semibold transition-all duration-300 hover:bg-gray-900 hover:shadow-[0_0_8px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </RainbowButton>

          {/* Sign in Link */}
          <div className="mt-4 text-xs text-gray-600">
            Have an account?{" "}
            <button
              onClick={handleGoToLogin}
              className="text-purple-600 hover:underline font-medium"
            >
              Sign in
            </button>
          </div>

          {/* Terms */}
          <p className="mt-2 text-[10px] text-gray-400 text-center leading-tight">
            By continuing, you agree to the{" "}
            <a href="#" className="underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>

      <style>{`
        @keyframes borderMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-border {
          background-size: 200% 200%;
          animation: borderMove 6s linear infinite;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default SignUpPage;