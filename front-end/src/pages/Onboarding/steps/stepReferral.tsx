"use client";
import { useState, useEffect } from "react";
import type { StepProps } from "../types";

const options = ["Friend", "Social Media", "Search", "Ad", "Other"];

export default function StepReferral({ onNext, data }: StepProps) {
    const [ref, setRef] = useState<string>(data?.referral || "");

    useEffect(() => {
        if (data?.referral) {
            setRef(data.referral);
        }
    }, [data]);

    const handleContinue = () => {
        onNext({ referral: ref });
    };

    return (
        <div className="space-y-4">
            {options.map((o) => (
                <button
                    key={o}
                    onClick={() => setRef(o)}
                    className={`w-full border p-3 rounded-lg text-left transition-colors ${
                        ref === o
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                    {o}
                </button>
            ))}

            <button
                onClick={handleContinue}
                disabled={!ref}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
                Continue
            </button>
        </div>
    );
}