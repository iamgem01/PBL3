"use client";
import { useState } from "react";

const options = ["Friend", "Social Media", "Search", "Ad", "Other"];

export default function StepReferral({ onNext }: { onNext: (data: object) => void }) {
    const [ref, setRef] = useState("");

    return (
        <div className="space-y-4">
            {options.map((o) => (
                <button
                    key={o}
                    onClick={() => setRef(o)}
                    className={`w-full border p-3 rounded-lg text-left ${
                        ref === o ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                >
                    {o}
                </button>
            ))}
            <button
                onClick={() => onNext({ referral: ref })}
                disabled={!ref}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
                Continue
            </button>
        </div>
    );
}
