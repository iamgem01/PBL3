type DocumentBlockType =
    | { type: "heading"; content: string }
    | { type: "subheading"; content: string }
    | { type: "paragraph"; content: string }
    | { type: "image"; src: string; caption?: string }
    | { type: "list"; items: string[] }
    | { type: "tip"; content: string }
    | { type: "note"; content: string };

interface DocumentBlockProps {
    block: DocumentBlockType;
}

export default function DocumentBlock({ block }: DocumentBlockProps) {
    switch (block.type) {
        case "heading":
            return <h1 className="text-3xl font-bold mb-6">{block.content}</h1>;

        case "subheading":
            return <h2 className="text-xl font-semibold mt-8 mb-3">{block.content}</h2>;

        case "paragraph":
            return <p className="text-gray-700 mb-4 leading-relaxed">{block.content}</p>;

        case "image":
            return (
                <figure className="my-6">
                    <img
                        src={block.src}
                        alt={block.caption}
                        className="rounded-xl shadow-sm mx-auto"
                    />
                    {block.caption && (
                        <figcaption className="text-sm text-gray-500 mt-2 text-center">
                            {block.caption}
                        </figcaption>
                    )}
                </figure>
            );

        case "list":
            return (
                <ul className="list-disc list-inside text-gray-700 mb-4">
                    {block.items.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            );

        case "tip":
            return (
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-lg text-sm text-gray-700 mb-4">
                    💡 <strong>Tip:</strong> {block.content}
                </div>
            );

        case "note":
            return (
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-lg text-sm text-gray-700 mb-4">
                    📝 <strong>Note:</strong> {block.content}
                </div>
            );

        default:
            return null;
    }
}
