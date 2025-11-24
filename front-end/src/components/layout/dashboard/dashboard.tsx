import { Calendar, Plus, Sparkles, TrendingUp } from "lucide-react";
import RecentlyVisited from "./RecentlyVisited";
import LearnSection from "./LearnSection";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/10 dark:via-purple-950/10 dark:to-pink-950/10">
            <div className="max-w-[1200px] mx-auto px-6 py-8">
                {/* Header with gradient accent */}
                <div className="mb-10">
                    <div className="inline-block">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            {getGreeting()}
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                        {getCurrentDate()}
                    </p>
                </div>

                {/* Quick Actions with gradient accents */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <button
                        onClick={() => navigate('/notes/new')}
                        className="group relative bg-card border-2 border-transparent hover:border-blue-500/30 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-1">New Document</h3>
                            <p className="text-sm text-muted-foreground">Start with a blank page</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/template')}
                        className="group relative bg-card border-2 border-transparent hover:border-purple-500/30 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-1">From Template</h3>
                            <p className="text-sm text-muted-foreground">Quick start with structure</p>
                        </div>
                    </button>

                    <button
                        className="group relative bg-card border-2 border-transparent hover:border-pink-500/30 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/20">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-1">Calendar</h3>
                            <p className="text-sm text-muted-foreground">View your schedule</p>
                        </div>
                    </button>
                </div>

                {/* Recently Visited Section */}
                <section className="mb-10">
                    <RecentlyVisited />
                </section>
                
                {/* Learn Section */}
                <section className="mb-10">
                    <LearnSection />
                </section>

                {/* Upcoming Events with gradient */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 rounded-full" />
                        <h2 className="text-lg font-semibold text-foreground">
                            Upcoming Events
                        </h2>
                    </div>
                    <div className="relative bg-card border border-border rounded-2xl p-10 text-center overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full -ml-16 -mb-16" />
                        <div className="relative">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 mb-4">
                                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                No events scheduled in the next 3 days
                            </p>
                            <button className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/20">
                                <Plus className="w-4 h-4" />
                                Create event
                            </button>
                        </div>
                    </div>
                </section>

                {/* Bottom padding */}
                <div className="h-8" />
            </div>
        </div>
    );
}