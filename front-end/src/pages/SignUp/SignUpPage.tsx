import React, { useEffect, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { RainbowButton } from "../../components/ui/rainbow-button";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers, FaRocket } from "react-icons/fa";

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const authStatus = params.get("auth");
        const errorParam = params.get("error");

        if (authStatus === "success") {
            console.log("Google sign up successful");
            setLoading(true);
            verifyAuth();
            window.history.replaceState({}, document.title, "/signup");
        } else if (errorParam) {
            console.error(" Sign up error:", errorParam);
            setError(getErrorMessage(errorParam));
            window.history.replaceState({}, document.title, "/signup");
        }
    }, [navigate]);

    const verifyAuth = async () => {
        try {
            const BACKEND = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:5000";
            const response = await fetch(`${BACKEND}/api/auth/me`, {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();

                // Thêm field hasCompletedOnboarding mặc định là false
                const userWithOnboarding = {
                    ...data.user,
                    hasCompletedOnboarding: data.user.hasCompletedOnboarding || false
                };

                localStorage.setItem("user", JSON.stringify(userWithOnboarding));

                // LUÔN chuyển đến onboarding sau khi sign up
                if (window.location.pathname === "/signup") {
                    navigate("/onboarding");
                }
                // Với login, kiểm tra trạng thái onboarding
                else if (window.location.pathname === "/login") {
                    if (userWithOnboarding.hasCompletedOnboarding) {
                        navigate("/home");
                    } else {
                        navigate("/onboarding");
                    }
                }
            } else {
                throw new Error("Authentication verification failed");
            }
        } catch (error) {
            console.error("Verify auth error:", error);
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
        const BACKEND = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:8000";
        window.location.href = `${BACKEND}/oauth2/authorization/google`;
    };

    const features = [
        {
            icon: <FaRocket className="text-blue-300 text-xl" />,
            title: 'Get Started Instantly',
            description: 'Begin organizing your thoughts in seconds with seamless onboarding.',
        },
        {
            icon: <Sparkles className="text-pink-300 text-xl" />,
            title: 'AI-Powered Organization',
            description: 'Let AI help categorize and structure your notes automatically.',
        },
        {
            icon: <FaUsers className="text-violet-300 text-xl" />,
            title: "Collaborate Effortlessly",
            description: "Share and work together with your team in one workspace"
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-inter font-medium">Creating your account...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br font-inter from-blue-50 via-white to-purple-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float animation-delay-4000"></div>
                <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-6000"></div>
            </div>

            {/* Left Side - Sign Up Card */}
            <div className="flex-1 flex items-center justify-center p-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-md relative z-20"
                >
                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative z-30">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="text-3xl font-gabarito font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
                            >
                               Create Account
                            </motion.h2>

                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                            >
                                <p className="text-sm text-red-600 text-center">{error}</p>
                            </motion.div>
                        )}

                        {/* Google Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <RainbowButton
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white text-gray-800 py-4 text-base font-semibold transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FcGoogle className="w-6 h-6" />
                                Sign up with Google
                            </RainbowButton>
                        </motion.div>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                            </div>
                        </div>

                        {/* Email Form (Placeholder for future implementation) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className="space-y-4"
                        >
                            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <p className="text-sm">
                                    Email sign up coming soon
                                </p>
                            </div>
                        </motion.div>

                        {/* Login Link */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1 }}
                            className="mt-4 text-center text-sm text-gray-600 relative z-40"
                        >
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-purple-600 hover:underline font-medium hover:text-purple-700 transition-colors px-2 py-1 bg-white rounded-md inline-block"
                            >
                                Sign in
                            </Link>
                        </motion.div>

                        {/* Terms */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.2 }}
                            className="mt-6 text-xs text-gray-400 text-center leading-relaxed"
                        >
                            By creating an account, you agree to our{" "}
                            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
                            and{" "}
                            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </motion.p>
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Features */}
            <div className="flex-1 flex items-center justify-center p-12">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl"
                >
                    {/* Logo and Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-300 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-5xl font-gabrito font-bold bg-gradient-to-r from-blue-500 to-purple-400 bg-clip-text text-transparent">
                                Aeternus
                            </h1>
                        </div>
                        <p className="text-2xl text-gray-800 font-light leading-relaxed">
                            Start your organized journey today.
                            <br />
                            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Join thousands who've transformed their workflow.
              </span>
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                className="flex items-start gap-4 p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                            >
                                <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-r shadow-lg">
                                    {feature.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
        </div>
    );
};

export default SignUpPage;