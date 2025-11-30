"use client";

import OnboardingForm from "./OnboardingForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra xem user đã đăng nhập chưa
        const user = localStorage.getItem("user");
        if (!user) {
            navigate("/login");
            return;
        }

        const userData = JSON.parse(user);
        // Nếu user đã hoàn thành onboarding, chuyển thẳng đến home
        if (userData.hasCompletedOnboarding) {
            navigate("/home");
            return;
        }

        setLoading(false);
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
                <OnboardingForm />
            </div>
        </div>
    );
}