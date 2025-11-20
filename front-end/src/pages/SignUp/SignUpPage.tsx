import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { RainbowButton } from "../../components/ui/rainbow-button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loginWithGoogle } from "../../utils/authUtils";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    loginWithGoogle();
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to Google...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* ... Background Blobs ... */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 p-[0.8px] rounded-2xl bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 animate-border"
      >
        <div className="rounded-2xl p-8 flex flex-col items-center w-80 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out">
          <div className="flex flex-col items-center mb-2">
            <BookOpen className="w-12 h-12 text-blue-600 mb-1" strokeWidth={1} />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Account
            </h2>
          </div>

          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 text-center">{error}</p>
            </div>
          )}

          <RainbowButton
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-full border border-gray-800 bg-black text-white py-2 text-sm font-semibold transition-all duration-300 hover:bg-gray-900 hover:shadow-[0_0_8px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </RainbowButton>

          <div className="mt-4 text-xs text-gray-600">
            Have an account?{" "}
            <button onClick={handleGoToLogin} className="text-purple-600 hover:underline font-medium">
              Sign in
            </button>
          </div>

          {/* ... Terms ... */}
        </div>
      </motion.div>
      <style>{`
        @keyframes borderMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-border { background-size: 200% 200%; animation: borderMove 6s linear infinite; }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default SignUpPage;