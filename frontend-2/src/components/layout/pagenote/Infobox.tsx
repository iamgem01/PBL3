interface InfoBoxProps {
  text: string;
}

export default function InfoBox({ text }: InfoBoxProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
      <p className="text-blue-800 text-sm">{text}</p>
    </div>
  );
}
