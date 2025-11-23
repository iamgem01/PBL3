"use client";
import { useState, useEffect } from "react";
import type { StepProps } from "../types";

const workTypes = [
    "Web Development",
    "Data Science",
    "AI",
    "Marketing",
    "Other",
];

export default function StepWorkType({ onNext, data }: StepProps) {
    const [work, setWork] = useState<string>(data?.work || "");

    useEffect(() => {
        if (data?.work) {
            setWork(data.work);
        }
    }, [data]);

    const handleContinue = () => {
        onNext({ work });
    };

    return (
        <div className="space-y-4">
            {workTypes.map((w) => (
                <button
                    key={w}
                    onClick={() => setWork(w)}
                    className={`w-full border p-3 rounded-lg text-left transition-colors ${
                        work === w
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                    {w}
                </button>
            ))}

            <button
                onClick={handleContinue}
                disabled={!work}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
                Continue
            </button>
        </div>
    );
}