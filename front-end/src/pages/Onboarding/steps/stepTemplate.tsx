"use client";
import { useState, useEffect } from "react";
import type { StepProps } from "../types";

const templates = [
    "Personal Knowledge Base",
    "Project Management",
    "Meeting Notes",
    "Content Creation",
    "Blank Template"
];

export default function StepTemplate({ onNext, data }: StepProps) {
    const [template, setTemplate] = useState<string>(data?.template || "");

    useEffect(() => {
        if (data?.template) {
            setTemplate(data.template);
        }
    }, [data]);

    const handleContinue = () => {
        onNext({ template });
    };

    return (
        <div className="space-y-4">
            {templates.map((t) => (
                <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`w-full border p-3 rounded-lg text-left transition-colors ${
                        template === t
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                    {t}
                </button>
            ))}

            <button
                onClick={handleContinue}
                disabled={!template}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
                Complete Setup
            </button>
        </div>
    );
}