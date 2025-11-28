import { useEffect, useState } from "react";
import { Users, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSharedNotes } from "@/services/collabService";
import { getAllNotes } from "@/services/noteService";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isImportant: boolean;
  shares?: any[]; // Thêm thuộc tính shares từ collab-service
}

interface SidebarTeamspaceProps {
    collapsed: boolean;
}

interface TeamspaceItem {
  id: string;
  label: string;
  icon: React.JSX.Element;
  type: 'shared-doc';
  note: Note;
}

export default function SidebarTeamspace({ collapsed }: SidebarTeamspaceProps) {
    const navigate = useNavigate();
    const [notes, setNotes] = useState<Note[]>([]);
    const [sharedNotes, setSharedNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sharedLoading, setSharedLoading] = useState(true);
    const [sharedError, setSharedError] = useState<string | null>(null);

    // Fetch all notes từ note-service với error handling tốt hơn
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setIsLoading(true);
                console.log('📋 Fetching personal notes...');
                
                const notesData = await getAllNotes();
                
                // Double-check: Chỉ hiển thị notes của user hiện tại
                const userData = localStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    // Backend sử dụng SNAKE_CASE, nên field là created_by
                    const userNotes = notesData.filter((note: any) => 
                        note.created_by === user.id
                    );
                    
                    if (userNotes.length !== notesData.length) {
                        console.warn(`🚨 Filtered ${notesData.length - userNotes.length} notes that don't belong to current user`);
                    }
                    
                    setNotes(userNotes);
                    console.log(`✅ Loaded ${userNotes.length} personal notes for user ${user.id}`);
                } else {
                    console.error('❌ No user data available');
                    setNotes([]);
                }
                
            } catch (err: any) {
                console.error("❌ Failed to fetch personal notes:", err);
                setNotes([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, []); // Không có dependencies để tránh re-fetch không cần thiết

    // Fetch shared notes từ collab-service sử dụng service function có sẵn
    useEffect(() => {
        const fetchSharedNotes = async () => {
            try {
                setSharedLoading(true);
                console.log('🔄 Fetching shared notes...');
                
                // Sử dụng function getSharedNotes có sẵn thay vì gọi API trực tiếp
                const sharedData = await getSharedNotes();
                setSharedNotes(sharedData);
                console.log(`✅ Loaded ${sharedData.length} shared notes`);
                
            } catch (err: any) {
                console.error("❌ Failed to fetch shared notes:", err);
                setSharedError(err.message);
                setSharedNotes([]);
            } finally {
                setSharedLoading(false);
            }
        };

        fetchSharedNotes();
    }, []);

    // Refresh shared notes manually
    const handleRefreshShared = async () => {
        setSharedLoading(true);
        setSharedError(null);
        
        try {
            const sharedNotesData = await getSharedNotes();
            setSharedNotes(sharedNotesData);
            console.log('🔄 Refreshed shared notes');
        } catch (err: any) {
            console.error("❌ Refresh failed:", err);
            setSharedError(err.message);
        } finally {
            setSharedLoading(false);
        }
    };

    // Tạo danh sách shared documents
    const sharedDocuments: TeamspaceItem[] = sharedNotes.map(note => ({
        id: note.id,
        label: note.title || "Untitled",
        icon: <Users size={14} className="text-blue-500" />,
        type: 'shared-doc' as const,
        note: note
    }));

    const truncateTitle = (title: string, maxLength: number = 20) => {
        if (!title) return "Untitled";
        return title.length > maxLength ? title.substring(0, maxLength) + "..." : title;
    };

    const getNoteIcon = (title: string, content: string) => {
        const lowerTitle = title?.toLowerCase() || "";
        const lowerContent = content?.toLowerCase() || "";
        
        if (lowerTitle.includes('task') || lowerContent.includes('todo')) return '📋';
        if (lowerTitle.includes('journal') || lowerContent.includes('note')) return '📓';
        if (lowerTitle.includes('project') || lowerContent.includes('brainstorm')) return '🧠';
        if (lowerTitle.includes('travel') || lowerContent.includes('trip')) return '🧳';
        return '📄';
    };

    const handleItemClick = (item: TeamspaceItem) => {
        console.log('📖 Opening shared document:', item.note.id);
        navigate(`/notes/${item.note.id}`);
    };

    return (
        <div className="border-t border-border p-3 text-sm">
            {/* TEAMSPACES SECTION */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    {!collapsed && (
                        <h3 className="text-xs text-muted-foreground font-semibold tracking-wide">
                            Teamspaces
                        </h3>
                    )}
                    <button
                        onClick={handleRefreshShared}
                        disabled={sharedLoading}
                        className={`p-1 rounded hover:bg-muted transition-colors ${
                            collapsed ? 'mx-auto' : ''
                        }`}
                        title="Refresh shared notes"
                    >
                        <RefreshCw 
                            size={14} 
                            className={`text-muted-foreground ${sharedLoading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>

                <div className="space-y-1">
                    {sharedLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                    ) : sharedError ? (
                        <div className={`text-xs text-red-500 ${collapsed ? 'text-center' : ''} py-2`}>
                            {collapsed ? (
                                <AlertCircle size={16} className="mx-auto" />
                            ) : (
                                <>
                                    <div className="flex items-center gap-1 mb-1">
                                        <AlertCircle size={12} />
                                        <span>Error loading</span>
                                    </div>
                                    <button
                                        onClick={handleRefreshShared}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Retry
                                    </button>
                                </>
                            )}
                        </div>
                    ) : sharedDocuments.length > 0 ? (
                        sharedDocuments.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className={`flex items-center ${
                                    collapsed ? "justify-center" : "gap-2"
                                } w-full px-2 py-2 text-muted-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 rounded-lg transition-colors group`}
                                title={collapsed ? item.label : ''}
                            >
                                {item.icon}
                                {!collapsed && (
                                    <span className="font-normal text-sm flex-1 text-left truncate">
                                        {truncateTitle(item.label)}
                                    </span>
                                )}
                                {!collapsed && item.note.shares && item.note.shares.length > 0 && (
                                    <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.note.shares.length === 1 && item.note.shares[0] === 'all' 
                                            ? 'All' 
                                            : item.note.shares.length}
                                    </span>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="text-xs text-muted-foreground text-center py-3">
                            {collapsed ? (
                                <Users size={16} className="mx-auto opacity-30" />
                            ) : (
                                <div>
                                    <Users size={20} className="mx-auto mb-2 opacity-30" />
                                    <p>No shared documents</p>
                                    <p className="text-[10px] mt-1 opacity-70">
                                        Share a note to collaborate
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ALL NOTES SECTION */}
            <div>
                {!collapsed && (
                    <h3 className="text-xs text-muted-foreground mb-2 px-1 font-semibold tracking-wide">
                        All Notes
                    </h3>
                )}
                <div className="space-y-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                    ) : notes.length > 0 ? (
                        notes.slice(0, 10).map((note) => (
                            <button
                                key={note.id}
                                onClick={() => navigate(`/notes/${note.id}`)}
                                className={`flex items-center ${
                                    collapsed ? "justify-center" : "gap-2"
                                } w-full px-2 py-2 text-foreground hover:bg-muted rounded-lg transition-colors`}
                                title={collapsed ? note.title : ''}
                            >
                                <span className="text-sm">{getNoteIcon(note.title, note.content)}</span>
                                {!collapsed && (
                                    <span className="font-normal text-xs truncate flex-1 text-left">
                                        {truncateTitle(note.title, 18)}
                                    </span>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="text-xs text-muted-foreground text-center py-3">
                            {collapsed ? "📝" : "No notes yet"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}