import React from "react";
import { BookOpen } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { RainbowButton } from "../../components/ui/rainbow-button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    // useEffect(() => {
    //     const params = new URLSearchParams(window.location.search);
    //     const token = params.get("token");
    //
    //     if (token) {
    //         console.log("Received token from backend:", token);
    //
    //
    //         localStorage.setItem("token", token);
    //
    //
    //         window.history.replaceState({}, document.title, "/home");
    //
    //
    //         navigate("/home");
    //     }
    // }, [navigate]);

    const handleGoogleLogin = () => {
        console.log('🔑 Redirecting to backend OAuth2...');
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    const handleGoToSignUp = () => {
        navigate("/signup");
    };

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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 p-[0.8px] rounded-2xl bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 animate-border"
            >
                <div className="rounded-2xl p-8 flex flex-col items-center w-80 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out">

                    {/* Title + Logo */}
                    <div className="flex items-center justify-between w-full mb-4">
                        <div className="flex flex-col items-start">
                            <p className="text-sm text-gray-800 font-medium">Welcome back</p>
                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                                Sign in
                            </h2>
                        </div>
                        <BookOpen className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
                    </div>

                    {/* Google Button */}
                    <RainbowButton
                        onClick={handleGoogleLogin}
                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-full border border-gray-800 bg-black text-white py-2 text-sm font-semibold transition-all duration-300 hover:bg-gray-900 hover:shadow-[0_0_8px_rgba(147,51,234,0.4)]"
                    >
                        <FcGoogle className="w-5 h-5" />
                        Sign in with Google
                    </RainbowButton>

                    {/* Sign up link */}
                    <div className="mt-4 text-xs text-gray-600">
                        Don’t have an account?{" "}
                        <button
                            onClick={handleGoToSignUp}
                            className="text-purple-600 hover:underline font-medium"
                        >
                            Create one
                        </button>
                    </div>

                    {/* Terms */}
                    <p className="mt-2 text-[10px] text-gray-400 text-center leading-tight">
                        By signing in, you agree to the{" "}
                        <a href="#" className="underline">Terms & Conditions</a>{" "}
                        and{" "}
                        <a href="#" className="underline">Privacy Policy</a>
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
            `}</style>
        </div>
    );
};

export default LoginPage;
