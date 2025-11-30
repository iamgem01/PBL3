"use client";
import { useState, useEffect } from "react";
import type { StepProps } from "../types";

const needs = ["Learn faster", "Collaborate", "Build apps", "Automate work"];

export default function StepNeeds({ onNext, data }: StepProps) {
    const [selected, setSelected] = useState<string[]>(data?.needs || []);

    useEffect(() => {
        if (data?.needs) {
            setSelected(data.needs);
        }
    }, [data]);

    const toggle = (item: string) =>
        setSelected((prev) =>
            prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
        );

    const handleContinue = () => {
        onNext({ needs: selected });
    };

    return (
        <div className="space-y-4">
            {needs.map((n) => (
                <button
                    key={n}
                    onClick={() => toggle(n)}
                    className={`w-full border p-3 rounded-lg text-left transition-colors ${
                        selected.includes(n)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                    {n}
                </button>
            ))}
            <button
                onClick={handleContinue}
                disabled={selected.length === 0}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
                Continue
            </button>
        </div>
    );
}