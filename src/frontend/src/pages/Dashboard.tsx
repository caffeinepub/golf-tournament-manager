import { useNavigate } from "@tanstack/react-router";
import { Trophy, Users, Activity, ChevronRight, Flag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext, TournamentStatus } from "../context/AppContext";
import { TournamentCard } from "../components/TournamentCard";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xl font-bold font-serif text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground font-sans mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { tournaments, players, isLoading } = useAppContext();

  const inProgress = tournaments.filter(
    (t) => t.status === TournamentStatus.inProgress
  );
  const upcoming = tournaments.filter((t) => t.status === TournamentStatus.upcoming);
  const completed = tournaments.filter((t) => t.status === TournamentStatus.completed);

  return (
    <main className="min-h-screen pb-nav bg-background">
      {/* Hero Header */}
      <header className="header-gradient px-4 pt-12 pb-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Flag size={20} className="text-white/80" />
            <span className="text-white/80 text-sm font-sans font-medium tracking-wide uppercase">
              Golf Manager
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-white leading-tight">
            Tournament
            <br />
            Dashboard
          </h1>
          <p className="text-white/60 text-sm font-sans mt-2">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 -mt-4">
        {/* Stats Row */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-6 stagger-children">
            <StatCard
              icon={Trophy}
              label="Tournaments"
              value={tournaments.length}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              icon={Users}
              label="Players"
              value={players.length}
              color="bg-accent/20 text-accent-foreground"
            />
            <StatCard
              icon={Activity}
              label="Live Now"
              value={inProgress.length}
              color="bg-green-100 text-green-700"
            />
          </div>
        )}

        {/* Active Tournaments */}
        {isLoading ? (
          <section className="mb-6">
            <Skeleton className="h-5 w-40 mb-3" />
            <div className="space-y-3">
              <Skeleton className="h-28 rounded-xl" />
            </div>
          </section>
        ) : inProgress.length > 0 ? (
          <section className="mb-6 page-enter">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold font-serif text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 status-pulse" />
                Active Tournaments
              </h2>
              <button
                type="button"
                onClick={() => void navigate({ to: "/tournaments" })}
                className="text-xs text-primary font-medium font-sans flex items-center gap-0.5"
              >
                All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {inProgress.map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Upcoming */}
        {!isLoading && upcoming.length > 0 && (
          <section className="mb-6 page-enter">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold font-serif text-foreground">
                Upcoming
              </h2>
              <button
                type="button"
                onClick={() => void navigate({ to: "/tournaments" })}
                className="text-xs text-primary font-medium font-sans flex items-center gap-0.5"
              >
                All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Results */}
        {!isLoading && completed.length > 0 && (
          <section className="mb-6 page-enter">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold font-serif text-foreground">
                Recent Results
              </h2>
            </div>
            <div className="space-y-3">
              {completed.slice(0, 3).map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading && tournaments.length === 0 && (
          <div className="text-center py-16 page-enter">
            <Trophy size={48} className="text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-bold font-serif text-foreground mb-2">
              No tournaments yet
            </h3>
            <p className="text-muted-foreground text-sm font-sans mb-6">
              Create your first tournament to get started
            </p>
            <button
              type="button"
              onClick={() => void navigate({ to: "/tournaments" })}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium font-sans"
            >
              <Trophy size={16} />
              Create Tournament
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-muted-foreground font-sans">
          <p>
            © 2026. Built with ♥ using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
