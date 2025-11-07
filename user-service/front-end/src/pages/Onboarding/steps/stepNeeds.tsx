"use client";
import { useState } from "react";

const needs = ["Learn faster", "Collaborate", "Build apps", "Automate work"];

export default function StepNeeds({ onNext }: { onNext: (data: object) => void }) {
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (item: string) =>
        setSelected((prev) =>
            prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
        );

    return (
        <div className="space-y-4">
            {needs.map((n) => (
                <button
                    key={n}
                    onClick={() => toggle(n)}
                    className={`w-full border p-3 rounded-lg text-left ${
                        selected.includes(n) ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                >
                    {n}
                </button>
            ))}
            <button
                onClick={() => onNext({ needs: selected })}
                disabled={selected.length === 0}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
                Continue
            </button>
        </div>
    );
}
