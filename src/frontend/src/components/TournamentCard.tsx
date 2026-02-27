import { useNavigate } from "@tanstack/react-router";
import { Calendar, MapPin, Users, ChevronRight } from "lucide-react";
import { Tournament, TournamentStatus } from "../context/AppContext";
import { StatusBadge, FormatBadge } from "./StatusBadge";
import { usePlayersForTournament } from "../hooks/useQueries";

interface TournamentCardProps {
  tournament: Tournament;
}

function formatDate(timeNs: bigint): string {
  const ms = Number(timeNs / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TournamentPlayerCount({ tournamentId }: { tournamentId: string }) {
  const { data: players } = usePlayersForTournament(tournamentId);
  const count = players?.length ?? 0;
  return (
    <span className="flex items-center gap-1">
      <Users size={12} />
      {count} {count === 1 ? "player" : "players"}
    </span>
  );
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const navigate = useNavigate();

  const isLive = tournament.status === TournamentStatus.inProgress;

  return (
    <button
      type="button"
      className={[
        "w-full text-left bg-card rounded-xl shadow-card hover:shadow-card-hover",
        "border transition-all duration-200 active:scale-[0.99]",
        isLive ? "border-green-200" : "border-border",
      ].join(" ")}
      onClick={() => void navigate({ to: "/tournaments/$id", params: { id: tournament.id } })}
    >
      {/* Green accent top bar for live tournaments */}
      {isLive && (
        <div className="h-1 rounded-t-xl bg-gradient-to-r from-green-600 to-green-400" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold font-serif text-foreground text-base leading-tight mb-1 truncate">
              {tournament.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={tournament.status} />
              <FormatBadge format={tournament.format} />
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground shrink-0 mt-0.5" />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
            <Calendar size={12} className="shrink-0" />
            <span>{formatDate(tournament.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{tournament.location}</span>
          </div>
          <div className="text-xs text-muted-foreground font-sans">
            <TournamentPlayerCount tournamentId={tournament.id} />
          </div>
        </div>
      </div>
    </button>
  );
}
