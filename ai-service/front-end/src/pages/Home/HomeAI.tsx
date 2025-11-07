import { Chatbox } from "../../components/ui/Chatbox";
export function HomeAI() {
    return (
        <main className="w-screen min-h-screen bg-transparent">
            {/* Background Gradient Effects */}
            <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse"
                     style={{ animationDelay: '700ms' }} />
                <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse"
                     style={{ animationDelay: '1000ms' }} />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
                <Chatbox />
            </div>
        </main>
    );
}
export default HomeAI;