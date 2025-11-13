import { useParams, useNavigate } from "react-router-dom";
import { documentContent } from "@/data/documentContent";
import DocumentBlock from "@/components/ui/documentBlock";
import type { DocumentBlockType } from "@/types/document";

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = id ? Number(id) : 0;
  const content = (documentContent as Record<number, DocumentBlockType[]>)[
    numericId
  ];
  if (!content) {
    return (
      <div className="p-10 text-center text-gray-500">
        <p>❌ Document not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/60 p-8 font-inter backdrop-blur-sm">
      <div className="max-w-3xl mx-auto bg-white/70 rounded-2xl shadow-lg backdrop-blur-md p-10 border border-gray-100">
        {content.map((block, index) => (
          <DocumentBlock key={index} block={block} />
        ))}
      </div>
    </div>
  );
}
