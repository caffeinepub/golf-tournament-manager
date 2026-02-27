import { useState, useCallback } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import {
  MapPin,
  Calendar,
  Trash2,
  Edit2,
  Plus,
  Minus,
  UserMinus,
  UserPlus,
  Medal,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useAppContext,
  TournamentStatus,
  TournamentFormat,
  type Tournament,
} from "../context/AppContext";
import {
  usePlayersForTournament,
  useScoresForPlayer,
  useTournamentLeaderboard,
} from "../hooks/useQueries";
import { StatusBadge, FormatBadge } from "../components/StatusBadge";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PageHeader } from "../components/PageHeader";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(timeNs: bigint): string {
  const ms = Number(timeNs / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInputValue(timeNs: bigint): string {
  const ms = Number(timeNs / 1_000_000n);
  return new Date(ms).toISOString().slice(0, 10);
}

// Standard par per hole (all par 4)
const PAR_PER_HOLE = 4;
const TOTAL_PAR = 72;
const HOLES = Array.from({ length: 18 }, (_, i) => i + 1);

function stablefordPoints(strokes: number, par: number): number {
  const diff = strokes - par;
  if (diff <= -2) return 4; // eagle+
  if (diff === -1) return 3; // birdie
  if (diff === 0) return 2;  // par
  if (diff === 1) return 1;  // bogey
  return 0;                  // double bogey+
}

// ─── Scorecard Tab ────────────────────────────────────────────────────────────

function ScorecardTab({
  tournamentId,
  isStableford,
}: {
  tournamentId: string;
  isStableford: boolean;
}) {
  const { players } = useAppContext();
  const { data: registeredPlayers, isLoading: playersLoading } =
    usePlayersForTournament(tournamentId);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  const effectivePlayerId =
    selectedPlayerId || (registeredPlayers?.[0]?.id ?? "");

  if (playersLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!registeredPlayers || registeredPlayers.length === 0) {
    return (
      <div className="p-4 text-center py-12">
        <p className="text-muted-foreground font-sans text-sm">
          No players registered yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Player selector */}
      <div>
        <Label className="font-sans text-sm mb-1.5 block">Select Player</Label>
        <Select
          value={effectivePlayerId}
          onValueChange={setSelectedPlayerId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pick a player..." />
          </SelectTrigger>
          <SelectContent>
            {registeredPlayers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} (HCP {Number(p.handicap)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {effectivePlayerId && (
        <PlayerScorecard
          key={effectivePlayerId}
          tournamentId={tournamentId}
          playerId={effectivePlayerId}
          playerName={
            players.find((p) => p.id === effectivePlayerId)?.name ??
            registeredPlayers.find((p) => p.id === effectivePlayerId)?.name ??
            ""
          }
          handicap={Number(
            registeredPlayers.find((p) => p.id === effectivePlayerId)?.handicap ?? 0n
          )}
          isStableford={isStableford}
        />
      )}
    </div>
  );
}

function PlayerScorecard({
  tournamentId,
  playerId,
  handicap,
  isStableford,
}: {
  tournamentId: string;
  playerId: string;
  playerName: string;
  handicap: number;
  isStableford: boolean;
}) {
  const { recordScore } = useAppContext();
  const { data: scores, refetch } = useScoresForPlayer(tournamentId, playerId);
  const [saving, setSaving] = useState<number | null>(null);

  // Build a map of hole -> strokes from existing scores
  const scoreMap = new Map<number, number>();
  scores?.forEach((s) => {
    scoreMap.set(Number(s.hole), Number(s.strokes));
  });

  const handleScoreChange = useCallback(
    async (hole: number, strokes: number) => {
      if (strokes < 1 || strokes > 15) return;
      setSaving(hole);
      try {
        await recordScore({ tournamentId, playerId, hole, strokes });
        await refetch();
      } catch {
        toast.error(`Failed to save score for hole ${hole}`);
      } finally {
        setSaving(null);
      }
    },
    [tournamentId, playerId, recordScore, refetch]
  );

  // Totals
  let grossTotal = 0;
  let stablefordTotal = 0;
  let holesPlayed = 0;
  HOLES.forEach((hole) => {
    const s = scoreMap.get(hole);
    if (s !== undefined) {
      grossTotal += s;
      stablefordTotal += stablefordPoints(s, PAR_PER_HOLE);
      holesPlayed++;
    }
  });
  const netTotal = grossTotal - handicap;
  const toPar = grossTotal - holesPlayed * PAR_PER_HOLE;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="bg-secondary/40 rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground font-sans">Gross</p>
          <p className="text-lg font-bold font-serif text-foreground">
            {holesPlayed > 0 ? grossTotal : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-sans">Net</p>
          <p className="text-lg font-bold font-serif text-foreground">
            {holesPlayed > 0 ? netTotal : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-sans">
            {isStableford ? "Pts" : "To Par"}
          </p>
          <p
            className={[
              "text-lg font-bold font-serif",
              !isStableford && holesPlayed > 0
                ? toPar < 0
                  ? "text-green-600"
                  : toPar > 0
                    ? "text-red-600"
                    : "text-foreground"
                : "text-foreground",
            ].join(" ")}
          >
            {holesPlayed > 0
              ? isStableford
                ? stablefordTotal
                : toPar === 0
                  ? "E"
                  : toPar > 0
                    ? `+${toPar}`
                    : toPar
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-sans">Holes</p>
          <p className="text-lg font-bold font-serif text-foreground">
            {holesPlayed}/18
          </p>
        </div>
      </div>

      {/* Front 9 */}
      <ScoreGrid
        label="Front 9"
        holes={HOLES.slice(0, 9)}
        scoreMap={scoreMap}
        saving={saving}
        isStableford={isStableford}
        onScoreChange={handleScoreChange}
      />
      {/* Back 9 */}
      <ScoreGrid
        label="Back 9"
        holes={HOLES.slice(9, 18)}
        scoreMap={scoreMap}
        saving={saving}
        isStableford={isStableford}
        onScoreChange={handleScoreChange}
      />
    </div>
  );
}

function ScoreGrid({
  label,
  holes,
  scoreMap,
  saving,
  isStableford,
  onScoreChange,
}: {
  label: string;
  holes: number[];
  scoreMap: Map<number, number>;
  saving: number | null;
  isStableford: boolean;
  onScoreChange: (hole: number, strokes: number) => void;
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="bg-primary px-3 py-2">
        <span className="text-primary-foreground text-xs font-medium font-sans uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="divide-y divide-border">
        {/* Header row */}
        <div className="grid grid-cols-[2fr_1fr_2fr_1fr] gap-0 bg-muted/50">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground font-sans">Hole</div>
          <div className="px-1 py-2 text-xs font-medium text-muted-foreground font-sans text-center">Par</div>
          <div className="px-1 py-2 text-xs font-medium text-muted-foreground font-sans text-center">Strokes</div>
          <div className="px-1 py-2 text-xs font-medium text-muted-foreground font-sans text-center">
            {isStableford ? "Pts" : "+/-"}
          </div>
        </div>
        {holes.map((hole) => {
          const strokes = scoreMap.get(hole);
          const isSaving = saving === hole;
          const diff = strokes !== undefined ? strokes - PAR_PER_HOLE : undefined;
          const pts =
            strokes !== undefined
              ? stablefordPoints(strokes, PAR_PER_HOLE)
              : undefined;

          return (
            <div
              key={hole}
              className={[
                "grid grid-cols-[2fr_1fr_2fr_1fr] gap-0 items-center",
                hole % 2 === 0 ? "bg-background" : "bg-card",
                isSaving ? "opacity-60" : "",
              ].join(" ")}
            >
              <div className="px-3 py-2.5">
                <span className="text-sm font-medium font-sans text-foreground">
                  #{hole}
                </span>
              </div>
              <div className="px-1 py-2.5 text-center">
                <span className="text-sm text-muted-foreground font-sans">
                  {PAR_PER_HOLE}
                </span>
              </div>
              <div className="px-1 py-1.5 flex items-center justify-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted active:scale-95 transition-all"
                  onClick={() => onScoreChange(hole, (strokes ?? PAR_PER_HOLE) - 1)}
                  disabled={isSaving}
                  aria-label={`Decrease score for hole ${hole}`}
                >
                  <Minus size={12} />
                </button>
                <span className="text-sm font-bold font-sans text-foreground w-6 text-center">
                  {strokes ?? "—"}
                </span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted active:scale-95 transition-all"
                  onClick={() => onScoreChange(hole, (strokes ?? PAR_PER_HOLE) + 1)}
                  disabled={isSaving}
                  aria-label={`Increase score for hole ${hole}`}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="px-1 py-2.5 text-center">
                {!isStableford && diff !== undefined && (
                  <span
                    className={[
                      "text-xs font-bold font-sans",
                      diff < 0
                        ? "text-green-600"
                        : diff > 0
                          ? "text-red-600"
                          : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {diff === 0 ? "E" : diff > 0 ? `+${diff}` : diff}
                  </span>
                )}
                {isStableford && pts !== undefined && (
                  <span className="text-xs font-bold font-sans text-primary">
                    {pts}
                  </span>
                )}
                {diff === undefined && pts === undefined && (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Players Tab ──────────────────────────────────────────────────────────────

function PlayersTab({ tournamentId }: { tournamentId: string }) {
  const { players, registerPlayer, removePlayer } = useAppContext();
  const { data: registeredPlayers, isLoading } = usePlayersForTournament(tournamentId);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const registeredIds = new Set(registeredPlayers?.map((p) => p.id) ?? []);
  const availablePlayers = players.filter((p) => !registeredIds.has(p.id));

  async function handleAdd(playerId: string) {
    setAdding(true);
    try {
      await registerPlayer(tournamentId, playerId);
      toast.success("Player added");
      setShowAdd(false);
    } catch {
      toast.error("Failed to add player");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(playerId: string, playerName: string) {
    setRemoving(playerId);
    try {
      await removePlayer(tournamentId, playerId);
      toast.success(`${playerName} removed`);
    } catch {
      toast.error("Failed to remove player");
    } finally {
      setRemoving(null);
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {/* Add player button */}
      <Button
        variant="outline"
        className="w-full gap-2 border-dashed"
        onClick={() => setShowAdd(true)}
        disabled={availablePlayers.length === 0}
      >
        <UserPlus size={16} />
        {availablePlayers.length === 0
          ? "All players registered"
          : `Add Player (${availablePlayers.length} available)`}
      </Button>

      {/* Player list */}
      {!registeredPlayers || registeredPlayers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground font-sans text-sm">
            No players registered yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {registeredPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border"
            >
              <PlayerAvatar name={player.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm font-sans text-foreground truncate">
                  {player.name}
                </p>
                <p className="text-xs text-muted-foreground font-sans">
                  Handicap {Number(player.handicap)}
                </p>
              </div>
              <button
                type="button"
                className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                onClick={() => void handleRemove(player.id, player.name)}
                disabled={removing === player.id}
                aria-label={`Remove ${player.name}`}
              >
                <UserMinus size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Player Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
            {availablePlayers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No players available to add.
              </p>
            ) : (
              availablePlayers.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-colors text-left"
                  onClick={() => void handleAdd(p.id)}
                  disabled={adding}
                >
                  <PlayerAvatar name={p.name} size="sm" />
                  <div>
                    <p className="font-medium text-sm font-sans text-foreground">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-sans">
                      HCP {Number(p.handicap)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Leaderboard Tab ──────────────────────────────────────────────────────────

function LeaderboardTab({
  tournamentId,
  isStableford,
}: {
  tournamentId: string;
  isStableford: boolean;
}) {
  const { data: leaderboard, isLoading } = useTournamentLeaderboard(tournamentId);
  const { data: players } = usePlayersForTournament(tournamentId);

  const playerMap = new Map(players?.map((p) => [p.id, p]) ?? []);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="p-4 text-center py-12">
        <Medal size={36} className="text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="text-sm text-muted-foreground font-sans">
          No scores recorded yet
        </p>
      </div>
    );
  }

  const RANK_STYLES = [
    "text-yellow-500 font-bold",  // 1st
    "text-slate-400 font-bold",   // 2nd
    "text-amber-600 font-bold",   // 3rd
  ];

  return (
    <div className="p-4 space-y-2">
      {/* Header */}
      <div className="grid grid-cols-[2rem_1fr_2rem_2.5rem_2.5rem_3rem] gap-1 px-3 py-2 text-xs text-muted-foreground font-sans">
        <span>#</span>
        <span>Player</span>
        <span className="text-center">HCP</span>
        <span className="text-center">Gross</span>
        <span className="text-center">Net</span>
        <span className="text-center">{isStableford ? "Pts" : "+/-"}</span>
      </div>

      {leaderboard.map((entry, idx) => {
        const player = playerMap.get(entry.player.id) ?? entry.player;
        const gross = Number(entry.totalGrossScore);
        const handicap = Number(player.handicap);
        const net = gross > 0 ? gross - handicap : 0;
        const toPar = gross > 0 ? gross - TOTAL_PAR : 0;
        const rank = idx + 1;
        const rankStyle =
          rank <= 3 ? RANK_STYLES[rank - 1] : "text-muted-foreground";

        return (
          <div
            key={entry.player.id}
            className={[
              "grid grid-cols-[2rem_1fr_2rem_2.5rem_2.5rem_3rem] gap-1 items-center",
              "bg-card border border-border rounded-xl px-3 py-3",
              rank === 1
                ? "border-yellow-200 bg-yellow-50/30"
                : "",
            ].join(" ")}
          >
            <span className={`text-sm font-bold font-sans ${rankStyle}`}>
              {rank}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <PlayerAvatar name={player.name} size="sm" />
              <span className="text-sm font-medium font-sans text-foreground truncate">
                {player.name.split(" ")[0]}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-sans text-center">
              {handicap}
            </span>
            <span className="text-sm font-bold font-sans text-foreground text-center">
              {gross > 0 ? gross : "—"}
            </span>
            <span className="text-sm font-sans text-foreground text-center">
              {gross > 0 ? net : "—"}
            </span>
            <span
              className={[
                "text-xs font-bold font-sans text-center",
                !isStableford && gross > 0
                  ? toPar < 0
                    ? "text-green-600"
                    : toPar > 0
                      ? "text-red-600"
                      : "text-muted-foreground"
                  : "text-primary",
              ].join(" ")}
            >
              {gross > 0
                ? isStableford
                  ? "—"
                  : toPar === 0
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
  );
}

// ─── Edit Tournament Dialog ───────────────────────────────────────────────────

function EditTournamentDialog({
  tournament,
  open,
  onClose,
}: {
  tournament: Tournament;
  open: boolean;
  onClose: () => void;
}) {
  const { updateTournament } = useAppContext();
  const [form, setForm] = useState({
    name: tournament.name,
    date: toDateInputValue(tournament.date),
    location: tournament.location,
    format: tournament.format,
    status: tournament.status,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const dateMs = new Date(form.date).getTime();
      await updateTournament({
        id: tournament.id,
        name: form.name,
        date: BigInt(dateMs) * 1_000_000n,
        format: form.format,
        status: form.status,
        location: form.location,
      });
      toast.success("Tournament updated");
      onClose();
    } catch {
      toast.error("Failed to update tournament");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="font-serif">Edit Tournament</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Format</Label>
            <Select
              value={form.format}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, format: v as TournamentFormat }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TournamentFormat.strokePlay}>Stroke Play</SelectItem>
                <SelectItem value={TournamentFormat.matchPlay}>Match Play</SelectItem>
                <SelectItem value={TournamentFormat.stableford}>Stableford</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans text-sm">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, status: v as TournamentStatus }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TournamentStatus.upcoming}>Upcoming</SelectItem>
                <SelectItem value={TournamentStatus.inProgress}>In Progress</SelectItem>
                <SelectItem value={TournamentStatus.completed}>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TournamentDetail() {
  const { id } = useParams({ from: "/tournaments/$id" });
  const navigate = useNavigate();
  const { tournaments, deleteTournament } = useAppContext();
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const tournament = tournaments.find((t) => t.id === id);
  const isStableford = tournament?.format === TournamentFormat.stableford;

  if (!tournament) {
    return (
      <main className="min-h-screen pb-nav bg-background">
        <PageHeader title="Tournament" backHref="/tournaments" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground font-sans">Tournament not found.</p>
        </div>
      </main>
    );
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTournament(tournament!.id);
      toast.success("Tournament deleted");
      await navigate({ to: "/tournaments" });
    } catch {
      toast.error("Failed to delete tournament");
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen pb-nav bg-background">
      <PageHeader
        title={tournament.name}
        backHref="/tournaments"
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
              onClick={() => setShowEdit(true)}
              aria-label="Edit tournament"
            >
              <Edit2 size={18} />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                  aria-label="Delete tournament"
                >
                  <Trash2 size={18} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif">
                    Delete Tournament?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-sans">
                    This will permanently delete "{tournament.name}" and all
                    associated scores. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => void handleDelete()}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      {/* Tournament info strip */}
      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={tournament.status} />
          <FormatBadge format={tournament.format} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
            <Calendar size={12} />
            {formatDate(tournament.date)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
            <MapPin size={12} />
            <span className="truncate max-w-[140px]">{tournament.location}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto">
        <Tabs defaultValue="players">
          <TabsList className="w-full rounded-none border-b border-border bg-background h-12 p-0">
            <TabsTrigger
              value="players"
              className="flex-1 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-sans text-sm"
            >
              Players
            </TabsTrigger>
            <TabsTrigger
              value="scores"
              className="flex-1 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-sans text-sm"
            >
              Scores
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="flex-1 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none font-sans text-sm"
            >
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="mt-0">
            <PlayersTab tournamentId={tournament.id} />
          </TabsContent>

          <TabsContent value="scores" className="mt-0">
            <ScorecardTab
              tournamentId={tournament.id}
              isStableford={isStableford}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
            <LeaderboardTab
              tournamentId={tournament.id}
              isStableford={isStableford}
            />
          </TabsContent>
        </Tabs>
      </div>

      <EditTournamentDialog
        tournament={tournament}
        open={showEdit}
        onClose={() => setShowEdit(false)}
      />
    </main>
  );
}
