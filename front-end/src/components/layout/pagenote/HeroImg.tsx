interface HeroImageProps {
  src: string;
  alt: string;
}

export default function HeroImage({ src, alt }: HeroImageProps) {
  return (
    <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
      <img src={src} alt={alt} className="w-full h-64 object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-all">
        {/* Example icon */}
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L4.5 20.5l.75-8.5L12 2z"/>
          <path d="M12 2l7.5 18.5-.75-8.5L12 2z"/>
          <path d="M5.25 12l6.75 8.5L19.5 12H5.25z"/>
        </svg>
      </button>
    </div>
  );
}
