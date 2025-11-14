import React from "react";

export const Tool = () => {
  return (
    <div className="relative w-[760px] h-[46px] bg-gray-50 rounded-md border border-solid border-gray-200">
      {/* Explain Button */}
      <button className="absolute top-[7px] left-[9px] w-[88px] h-8 rounded hover:bg-gray-100 transition-colors">
        <div className="absolute top-2 left-[34px] text-gray-700 text-[13.3px] font-medium">
          Explain
        </div>
        <div className="absolute top-2 left-[7px] w-4 h-4 opacity-[0.81]">
          <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
            <text x="8" y="11" textAnchor="middle" className="text-[10px] font-bold" fill="currentColor">i</text>
          </svg>
        </div>
      </button>

      {/* Ask AI Button */}
      <button className="absolute top-[7px] left-[101px] w-[65px] h-8 rounded hover:bg-gray-100 transition-colors">
        <div className="absolute top-2 left-[24px] text-gray-700 text-[13.1px] font-medium">
          Ask AI
        </div>
        <div className="absolute top-[9px] left-[6px] w-3.5 h-3.5 opacity-[0.59]">
          <svg className="w-full h-full" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L9 5L13 7L9 9L7 13L5 9L1 7L5 5L7 1Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
      </button>

      {/* Comment Button */}
      <button className="absolute top-[7px] left-[182px] w-[103px] h-8 rounded hover:bg-gray-100 transition-colors">
        <div className="absolute top-2 left-7 text-gray-700 text-[13px] font-medium">
          Comment
        </div>
        <div className="absolute top-2 left-2.5 w-4 h-4">
          <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
            <path d="M2 2h12v9H5l-3 3V2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
      </button>

      {/* Divider */}
      <div className="absolute top-4 left-[301px] w-px h-3.5 bg-gray-300"></div>

      {/* Text Button with Dropdown */}
      <button className="absolute top-[7px] left-[321px] w-[62px] h-8 rounded hover:bg-gray-100 transition-colors">
        <div className="absolute top-2 left-[10px] text-gray-700 text-[12.5px] font-medium">
          Text
        </div>
        <div className="absolute top-[10px] left-[46px] w-3 h-3">
          <svg className="w-full h-full" viewBox="0 0 12 12" fill="none">
            <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
      </button>

      {/* Text Formatting Buttons */}
      <div className="absolute top-[7px] left-[397px] flex items-center space-x-0">
        {/* Bold */}
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
          <span className="text-gray-700 text-sm font-bold">B</span>
        </button>
        
        {/* Italic */}
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
          <span className="text-gray-700 text-sm font-semibold italic">I</span>
        </button>
        
        {/* Underline */}
        <button className="w-8 h-8 flex items-center justify-center rounded bg-white hover:bg-gray-100 transition-colors">
          <span className="text-gray-700 text-sm">U̲</span>
        </button>
        
        {/* Strikethrough */}
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
          <span className="text-gray-700 text-sm line-through">S</span>
        </button>
        
        {/* Code */}
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M4 8h8M6 4l-2 4 2 4M10 4l2 4-2 4" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        
        {/* Link */}
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M6 10L10 6M8 4H11V7M5 12H8V9" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="absolute top-4 left-[542px] w-px h-3.5 bg-gray-300"></div>

      {/* Alignment Buttons */}
      <div className="absolute top-[7px] left-[555px] flex items-center space-x-0">
        {/* Align Left */}
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        
        {/* Bullet List */}
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <circle cx="3" cy="4" r="1" fill="currentColor"/>
            <circle cx="3" cy="8" r="1" fill="currentColor"/>
            <circle cx="3" cy="12" r="1" fill="currentColor"/>
            <path d="M6 4h8M6 8h8M6 12h8" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        
        {/* More Options */}
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M2 6L8 2L14 6M4 6v8h8V6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>
      </div>

      {/* Font Size Button */}
      <button className="absolute top-[7px] left-[643px] w-12 h-8 rounded hover:bg-gray-100 transition-colors flex items-center justify-center">
        <span className="text-gray-700 text-base font-bold">A</span>
        <svg className="w-3 h-3 ml-1" viewBox="0 0 12 12" fill="none">
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </button>

      {/* Color Button */}
      <button className="absolute top-[7px] left-[699px] w-8 h-8 rounded hover:bg-gray-100 transition-colors flex items-center justify-center">
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="3" y="10" width="10" height="3" rx="1" fill="currentColor"/>
        </svg>
      </button>

      {/* More Options Button */}
      <button className="absolute top-[9px] right-1.5 w-7 h-6 rounded hover:bg-gray-100 transition-colors flex items-center justify-center">
        <svg className="w-4 h-4 rotate-90" viewBox="0 0 16 16" fill="none">
          <circle cx="4" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
};

export default Tool;