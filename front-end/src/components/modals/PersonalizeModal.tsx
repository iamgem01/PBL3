import React, { useState } from "react";
import { X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import emojiList from "../../types/emoList";

interface PersonalizeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PersonalizeModal: React.FC<PersonalizeModalProps> = ({ isOpen, onClose }) => {
    const [userName, setUserName] = useState("");
    const [selectedEmojiIndex, setSelectedEmojiIndex] = useState(5); // Index của Duck

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({
            userName,
            selectedEmoji: emojiList[selectedEmojiIndex]?.emoji
        });
        onClose();
    };

    const handlePrevEmoji = () => {
        setSelectedEmojiIndex(prev =>
            prev === 0 ? emojiList.length - 1 : prev - 1
        );
    };

    const handleNextEmoji = () => {
        setSelectedEmojiIndex(prev =>
            prev === emojiList.length - 1 ? 0 : prev + 1
        );
    };

    if (!isOpen) return null;

    const currentEmoji = emojiList[selectedEmojiIndex]?.emoji || '🦆';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] font-inter">
            <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Personalize your Aeternus AI</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Avatar với emoji trên đầu */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            {/* Main Avatar - */}
                            <div className="w-24 h-24 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-800 text-3xl font-bold shadow-sm">
                                {userName ? userName.charAt(0).toUpperCase() : "U"}
                            </div>

                            {/* Emoji icon trên đầu avatar với nút điều hướng */}
                            <div className="absolute -top-2 -right-2 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={handlePrevEmoji}
                                    className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <ChevronLeft size={14} className="text-gray-600" />
                                </button>

                                <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-gray-200 shadow-sm">
                                    <span className="text-lg">{currentEmoji}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNextEmoji}
                                    className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <ChevronRight size={14} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 text-center">
                            Customize your AI experience
                        </p>
                    </div>

                    {/* Name Input */}
                    <div className="flex justify-center">
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="What should AI call you?"
                            className=" px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-inter"
                        />
                    </div>

                    {/* Emoji Selection */}
                    <div>
                        <div className="grid grid-cols-8 gap-2">
                            {emojiList.map(({ id, emoji, name }, index) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSelectedEmojiIndex(index)}
                                    className={`
                                        aspect-square rounded-lg border-2 transition-all
                                        flex items-center justify-center
                                        hover:scale-105 hover:shadow-sm
                                        ${selectedEmojiIndex === index
                                        ? 'border-blue-500 bg-blue-50 scale-105'
                                        : 'border-gray-200 bg-white'
                                    }
                                    `}
                                    title={name}
                                >
                                    <span className="text-xl">{emoji}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 text-center">
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 mx-auto"
                            >
                                <Plus size={14} />
                                Add custom emoji
                            </button>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setUserName("");
                                setSelectedEmojiIndex(5); // Reset về Duck
                            }}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-br from-blue-300 to-pink-300 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Done
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PersonalizeModal;