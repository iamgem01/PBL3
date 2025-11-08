"use client";

import { useState } from "react";

const roles = ["Engineer", "Designer", "Manager", "Student", "Other"];

interface StepRoleProps {
    onNext: (data: object) => void;
    data?: object;
}

export default function StepRole({ onNext }: StepRoleProps) {
    const [role, setRole] = useState<string>("");

    return (
        <div className="space-y-4">
            {roles.map((r) => (
                <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full border p-3 rounded-lg text-left ${
                        role === r ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                >
                    {r}
                </button>
            ))}

            <button
                onClick={() => onNext({ role })}
                disabled={!role}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
                Continue
            </button>
        </div>
    );
}
