"use client";
import { useState, useEffect } from "react";

const options = ["Friend", "Social Media", "Search", "Ad", "Other"];

interface StepReferralProps {
    onNext: (data: object) => void;
    data?: object;
}

export default function StepReferral({ onNext, data }: StepReferralProps) {
    const [ref, setRef] = useState<string>("");

    useEffect(() => {
        if (data && (data as any).referral) {
            setRef((data as any).referral);
        }
    }, [data]);

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
