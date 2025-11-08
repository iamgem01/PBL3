interface SectionHeaderProps {
    title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
    return <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-6">{title}</h2>;
}
