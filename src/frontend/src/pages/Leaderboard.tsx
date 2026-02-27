import { useState, useEffect } from "react";
import { BarChart2, Medal, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppContext, TournamentFormat, TournamentStatus } from "../context/AppContext";
import {
  useTournamentLeaderboard,
  usePlayersForTournament,
} from "../hooks/useQueries";
import { StatusBadge, FormatBadge } from "../components/StatusBadge";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PageHeader } from "../components/PageHeader";
import { useQueryClient } from "@tanstack/react-query";

const TOTAL_PAR = 72;

function stablefordPoints(strokes: number, par: number): number {
  const diff = strokes - par;
  if (diff <= -2) return 4;
  if (diff === -1) return 3;
  if (diff === 0) return 2;
  if (diff === 1) return 1;
  return 0;
}

const RANK_CONFIGS = [
  { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-600", label: "🥇" },
  { bg: "bg-slate-50 border-slate-200", text: "text-slate-500", label: "🥈" },
  { bg: "bg-amber-50 border-amber-200", text: "text-amber-600", label: "🥉" },
];

function LeaderboardTable({
  tournamentId,
  isStableford,
}: {
  tournamentId: string;
  isStableford: boolean;
}) {
  const { data: leaderboard, isLoading, refetch } = useTournamentLeaderboard(tournamentId);
  const { data: players } = usePlayersForTournament(tournamentId);
  const queryClient = useQueryClient();

  const playerMap = new Map(players?.map((p) => [p.id, p]) ?? []);

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["leaderboard", tournamentId] });
    void refetch();
  }

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <Medal size={48} className="text-muted-foreground mx-auto mb-4 opacity-40" />
        <h3 className="text-base font-bold font-serif text-foreground mb-2">
          No scores yet
        </h3>
        <p className="text-sm text-muted-foreground font-sans">
          Enter scores in the tournament scorecard to see rankings here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Refresh button */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground font-sans">
          {leaderboard.length} players ranked
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleRefresh}
        >
          <RefreshCw size={12} />
          Refresh
        </Button>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_3rem] gap-1 px-3 py-2 text-xs text-muted-foreground font-sans bg-muted/40 rounded-lg mb-2">
        <span className="text-center">Rank</span>
        <span>Player</span>
        <span className="text-center">HCP</span>
        <span className="text-center">Gross</span>
        <span className="text-center">Net</span>
        <span className="text-center">{isStableford ? "Pts" : "+/- Par"}</span>
      </div>

      <div className="space-y-2 stagger-children">
        {leaderboard.map((entry, idx) => {
          const player = playerMap.get(entry.player.id) ?? entry.player;
          const gross = Number(entry.totalGrossScore);
          const handicap = Number(player.handicap);
          const net = gross > 0 ? gross - handicap : 0;
          const toPar = gross > 0 ? gross - TOTAL_PAR : null;
          const rank = idx + 1;
          const rankCfg = rank <= 3 ? RANK_CONFIGS[rank - 1] : null;

          return (
            <div
              key={entry.player.id}
              className={[
                "grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_3rem] gap-1 items-center",
                "border rounded-xl px-3 py-3 transition-all",
                rankCfg ? `${rankCfg.bg}` : "bg-card border-border",
              ].join(" ")}
            >
              {/* Rank */}
              <div className="flex items-center justify-center">
                {rankCfg ? (
                  <span className="text-base">{rankCfg.label}</span>
                ) : (
                  <span className="text-sm font-bold font-sans text-muted-foreground">
                    {rank}
                  </span>
                )}
              </div>

              {/* Player */}
              <div className="flex items-center gap-2 min-w-0">
                <PlayerAvatar name={player.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold font-sans text-foreground truncate">
                    {player.name}
                  </p>
                </div>
              </div>

              {/* HCP */}
              <span className="text-xs text-muted-foreground font-sans text-center">
                {handicap}
              </span>

              {/* Gross */}
              <span className="text-sm font-bold font-sans text-foreground text-center">
                {gross > 0 ? gross : "—"}
              </span>

              {/* Net */}
              <span className="text-sm font-sans text-foreground text-center">
                {gross > 0 ? net : "—"}
              </span>

              {/* To Par / Points */}
              <span
                className={[
                  "text-xs font-bold font-sans text-center",
                  !isStableford && toPar !== null
                    ? toPar < 0
                      ? "text-green-600"
                      : toPar > 0
                        ? "text-red-600"
                        : "text-muted-foreground"
                    : "text-primary",
                ].join(" ")}
              >
                {toPar !== null && !isStableford
                  ? toPar === 0
                    ? "E"
                    : toPar > 0
                      ? `+${toPar}`
                      : toPar
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { tournaments, isLoading } = useAppContext();
  const [selectedId, setSelectedId] = useState<string>("");

  // Auto-select first active or most recent tournament
  useEffect(() => {
    if (tournaments.length === 0) return;
    if (selectedId && tournaments.find((t) => t.id === selectedId)) return;

    const live = tournaments.find((t) => t.status === TournamentStatus.inProgress);
    const first = live ?? tournaments[0];
    setSelectedId(first?.id ?? "");
  }, [tournaments, selectedId]);

  const selected = tournaments.find((t) => t.id === selectedId);
  const isStableford = selected?.format === TournamentFormat.stableford;

  return (
    <main className="min-h-screen pb-nav bg-background">
      <PageHeader title="Leaderboard" />

      {/* Tournament selector */}
      <div className="sticky top-[72px] z-30 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          {isLoading ? (
            <Skeleton className="h-10 rounded-lg" />
          ) : tournaments.length === 0 ? (
            <p className="text-sm text-muted-foreground font-sans text-center py-1">
              No tournaments available
            </p>
          ) : (
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="font-sans">
                <SelectValue placeholder="Select a tournament..." />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-sans">{t.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Selected tournament info */}
        {selected && (
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 flex-wrap">
            <StatusBadge status={selected.status} />
            <FormatBadge format={selected.format} />
            <span className="text-xs text-muted-foreground font-sans">
              {selected.location}
            </span>
          </div>
        )}

        {/* Leaderboard table */}
        {!selectedId ? (
          <div className="text-center py-16 px-4">
            <BarChart2
              size={48}
              className="text-muted-foreground mx-auto mb-4 opacity-40"
            />
            <p className="text-sm text-muted-foreground font-sans">
              Select a tournament to view rankings
            </p>
          </div>
        ) : (
          <LeaderboardTable
            key={selectedId}
            tournamentId={selectedId}
            isStableford={isStableford}
          />
        )}
      </div>
    </main>
  );
}
