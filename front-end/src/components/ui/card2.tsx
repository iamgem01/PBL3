export type CardProps = {
    title: string;
    image?: string;
    description?: string;
    time?: string;
};

export default function Card({ title, time, image }: CardProps) {
    return (
        <div className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition p-2">
            <img src={image} alt={title} className="rounded-xl h-32 w-full object-cover" />
            <div className="px-2 py-1">
                <h3 className="font-medium text-gray-800 truncate">{title}</h3>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
}
