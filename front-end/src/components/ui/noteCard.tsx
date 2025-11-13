import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function NoteCard({ id, title, image, time }: any) {
    const navigate = useNavigate();
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/notes/${id}`)}
            className="min-w-[180px] cursor-pointer bg-white rounded-xl shadow-sm border hover:shadow-md transition-all"
        >
            <img src={image} alt={title} className="w-full h-24 object-cover rounded-t-xl" />
            <div className="p-3 text-sm">
                <h3 className="font-medium text-gray-800 truncate">{title}</h3>
                <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                    <Clock size={12} /> {time}
                </p>
            </div>
        </motion.div>
    );
}
