import React, { useEffect, useState, useRef } from "react";

interface TypingTextProps {
  text: string;
}

const TypingText: React.FC<TypingTextProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText(""); 
    indexRef.current = 0;
    
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.substring(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, 50); 

    return () => clearInterval(interval);
  }, [text]);

  return (
    <h2 className="text-3xl md:text-4xl font-inter font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent relative inline-block">
      {displayedText}
      <span className="border-r-2 border-blue-500 animate-blink ml-1"></span>
    </h2>
  );
};

export default TypingText;
