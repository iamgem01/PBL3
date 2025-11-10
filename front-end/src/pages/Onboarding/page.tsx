"use client";

import OnboardingForm from "./OnboardingForm";

export default function OnboardingPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
                <OnboardingForm />
            </div>
        </div>
    );
}
