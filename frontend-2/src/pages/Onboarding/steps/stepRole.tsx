"use client";
import { useState, useEffect } from "react";
import type { StepProps } from "../types";

const roles = ["Engineer", "Designer", "Manager", "Student", "Other"];

export default function StepRole({ onNext, data }: StepProps) {
    const [role, setRole] = useState<string>(data?.role || "");

    useEffect(() => {
        if (data?.role) {
            setRole(data.role);
        }
    }, [data]);

    const handleContinue = () => {
        onNext({ role });
    };

    return (
        <div className="space-y-4">
            {roles.map((r) => (
                <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full border p-3 rounded-lg text-left transition-colors ${
                        role === r
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                    {r}
                </button>
            ))}

            <button
                onClick={handleContinue}
                disabled={!role}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
                Continue
            </button>
        </div>
    );
}