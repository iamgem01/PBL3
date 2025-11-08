"use client";
import { useState, useEffect } from "react";

const templates = ["Team Workspace", "AI Assistant", "Project Planner", "Note Board"];

interface StepTemplateProps {
    onNext: (data: object) => void;
    data?: object;
}

export default function StepTemplate({ onNext, data }: StepTemplateProps) {
    const [selected, setSelected] = useState<string>("");


    useEffect(() => {
        if (data && (data as any).template) {
            setSelected((data as any).template);
        }
    }, [data]);

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
