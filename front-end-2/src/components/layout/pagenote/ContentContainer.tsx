export default function ContentContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-10 py-8">
      {children}
    </div>
  );
}
