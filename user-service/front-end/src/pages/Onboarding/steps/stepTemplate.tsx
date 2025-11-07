"use client";
import { useState } from "react";

const templates = ["Team Workspace", "AI Assistant", "Project Planner", "Note Board"];

export default function StepTemplate({ onNext }: { onNext: (data: object) => void }) {
    const [selected, setSelected] = useState("");

    return (
        <div className="space-y-4">
            {templates.map((t) => (
                <button
                    key={t}
                    onClick={() => setSelected(t)}
                    className={`w-full border p-3 rounded-lg text-left ${
                        selected === t ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                >
                    {t}
                </button>
            ))}
            <button
                onClick={() => onNext({ template: selected })}
                disabled={!selected}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
                Finish
            </button>
        </div>
    );
}
