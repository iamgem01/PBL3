import React from 'react';

interface SelectionRange {
    userId: string;
    userName: string;
    start: number;
    end: number;
    color: string;
}

interface SelectionHighlighterProps {
    selections: SelectionRange[];
    content: string;
}

export const SelectionHighlighter: React.FC<SelectionHighlighterProps> = ({ 
    selections, 
    content 
}) => {
    if (selections.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {selections.map((selection) => (
                <div
                    key={`${selection.userId}-${selection.start}-${selection.end}`}
                    className="absolute border-2 border-dashed opacity-30"
                    style={{
                        backgroundColor: selection.color,
                        left: `${(selection.start / content.length) * 100}%`,
                        width: `${((selection.end - selection.start) / content.length) * 100}%`,
                        top: '2px',
                        bottom: '2px',
                        borderColor: selection.color,
                    }}
                    title={`${selection.userName}'s selection`}
                />
            ))}
        </div>
    );
};