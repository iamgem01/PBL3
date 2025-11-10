import React, { useEffect, useState } from "react";

interface FadeInTextProps {
  text: string;
  delay?: number; 
}

const FadeInText: React.FC<FadeInTextProps> = ({ text, delay = 1200 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <p
      className={`text-gray-500 font-sans mt-2 transition-opacity duration-700 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      {text}
    </p>
  );
};

export default FadeInText;
