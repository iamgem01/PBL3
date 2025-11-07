"use client";
import { useState } from "react";

const workTypes = ["Web Development", "Data Science", "AI", "Marketing", "Other"];

export default function StepWorkType({ onNext }: { onNext: (data: object) => void }) {
    const [work, setWork] = useState("");

    return (
        <div className="space-y-4">
            {workTypes.map((w) => (
                <button
                    key={w}
                    onClick={() => setWork(w)}
                    className={`w-full border p-3 rounded-lg text-left ${
                        work === w ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                >
                    {w}
                </button>
            ))}
            <button
                onClick={() => onNext({ work })}
                disabled={!work}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
                Continue
            </button>
        </div>
    );
}
