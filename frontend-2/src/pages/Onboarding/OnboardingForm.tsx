"use client";

import { useState } from "react";
import StepRole from "./steps/stepRole";
import StepWorkType from "./steps/stepWorkType";
import StepNeeds from "./steps/stepNeeds";
import StepReferral from "./steps/stepReferral";
import StepTemplate from "./steps/stepTemplate";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { OnboardingData } from "./types";

const steps = [
    { id: 1, title: "What's your role?", component: StepRole },
    { id: 2, title: "What kind of work do you do?", component: StepWorkType },
    { id: 3, title: "What else can we help you with?", component: StepNeeds },
    { id: 4, title: "How did you hear about Aeternus?", component: StepReferral },
    { id: 5, title: "Recommended starter kits", component: StepTemplate },
];

export default function OnboardingForm() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<OnboardingData>({});

    const CurrentStep = steps.find((s) => s.id === step)?.component ?? null;

    const handleCompleteOnboarding = () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.hasCompletedOnboarding = true;
        user.onboardingData = formData;
        localStorage.setItem("user", JSON.stringify(user));

        console.log("🎉 Onboarding completed:", formData);
        navigate("/home");
    };

    const handleNext = (data?: Partial<OnboardingData>) => {
        if (data) {
            const updatedData = { ...formData, ...data };
            setFormData(updatedData);

            if (step === steps.length) {
                handleCompleteOnboarding();
                return;
            }
        }

        if (step < steps.length) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    {steps.find((s) => s.id === step)?.title}
                </h1>
            </div>

            {CurrentStep && <CurrentStep onNext={handleNext} data={formData} />}

            <div className="flex justify-between mt-8">
                {step > 1 && (
                    <Button variant="outline" onClick={handleBack}>
                        Back
                    </Button>
                )}
                <div className="flex-1"></div>
                <Button onClick={() => handleNext()}>
                    {step === steps.length ? "Complete" : "Next"}
                </Button>
            </div>

            <div className="mt-4 text-sm text-gray-400 text-center">
                Step {step} of {steps.length}
            </div>
        </div>
    );
}