import RecentlyVisited from "./RecentlyVisited";
import LearnSection from "./LearnSection";

export default function Dashboard() {
    return (
        <div className="flex-1 bg-gradient-to-br from-background via-muted/20 to-muted/30 overflow-y-auto flex justify-center">
            <div className="w-full max-w-5xl px-10 py-8">
                {/* Header */}
                <h1 className="text-4xl font-gabarito font-medium mb-8 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
                    Hi, good morning
                </h1>

                {/* Recently Visited Section */}
                <section className="mb-10">
                    <div className="overflow-x-auto pb-3">
                        <RecentlyVisited />
                    </div>
                </section>
                
                {/* Learn Section */}
                <section className="mb-10">
                    <div className="overflow-x-auto pb-3">
                        <LearnSection />
                    </div>
                </section>

                {/* Event Section */}
                <div className="mt-8 text-center font-inter text-muted-foreground text-sm border border-border rounded-2xl bg-card shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                    No upcoming events in the next 3 days <br />
                    <button className="mt-2 text-primary font-medium font-inter hover:underline hover:opacity-80 transition-opacity">
                        + New events
                    </button>
                </div>
            </div>
        </div>
    );
}