import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Edit2, Trash2, Trophy, Calendar, MapPin } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext";
import { useTournamentsForPlayer } from "../hooks/useQueries";
import { StatusBadge, FormatBadge } from "../components/StatusBadge";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PageHeader } from "../components/PageHeader";

function formatDate(timeNs: bigint): string {
  const ms = Number(timeNs / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PlayerDetail() {
  const { id } = useParams({ from: "/players/$id" });
  const navigate = useNavigate();
  const { players, updatePlayer, deletePlayer } = useAppContext();
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const player = players.find((p) => p.id === id);

  const { data: tournamentHistory, isLoading: historyLoading } =
    useTournamentsForPlayer(id);

  const [editForm, setEditForm] = useState({
    name: player?.name ?? "",
    handicap: String(Number(player?.handicap ?? 0n)),
  });
  const [saving, setSaving] = useState(false);

  if (!player) {
    return (
      <main className="min-h-screen pb-nav bg-background">
        <PageHeader title="Player" backHref="/players" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground font-sans">Player not found.</p>
        </div>
      </main>
    );
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    const hcp = parseInt(editForm.handicap);
    if (!editForm.name.trim() || isNaN(hcp)) {
      toast.error("Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      await updatePlayer({ id: player!.id, name: editForm.name, handicap: hcp });
      toast.success("Player updated");
      setShowEdit(false);
    } catch {
      toast.error("Failed to update player");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePlayer(player!.id);
      toast.success("Player deleted");
      await navigate({ to: "/players" });
    } catch {
      toast.error("Failed to delete player");
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen pb-nav bg-background">
      <PageHeader
        title={player.name}
        backHref="/players"
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
              onClick={() => {
                setEditForm({
                  name: player.name,
                  handicap: String(Number(player.handicap)),
                });
                setShowEdit(true);
              }}
              aria-label="Edit player"
            >
              <Edit2 size={18} />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                  aria-label="Delete player"
                >
                  <Trash2 size={18} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif">Delete Player?</AlertDialogTitle>
                  <AlertDialogDescription className="font-sans">
                    This will permanently delete "{player.name}". This cannot be undone.
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

      {/* Profile Card */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-card page-enter">
          <PlayerAvatar name={player.name} size="lg" />
          <div>
            <h2 className="text-xl font-bold font-serif text-foreground">
              {player.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm font-medium font-sans px-3 py-1 rounded-full">
                HCP {Number(player.handicap)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament History */}
      <div className="max-w-md mx-auto px-4">
        <h3 className="text-base font-bold font-serif text-foreground mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-primary" />
          Tournament History
        </h3>

        {historyLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : !tournamentHistory || tournamentHistory.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-xl border border-border">
            <Trophy size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground font-sans">
              No tournaments played yet
            </p>
          </div>
        ) : (
          <div className="space-y-2 stagger-children">
            {tournamentHistory.map((t) => (
              <button
                type="button"
                key={t.id}
                className="w-full text-left bg-card rounded-xl border border-border p-3 hover:shadow-card-hover transition-all"
                onClick={() => void navigate({ to: "/tournaments/$id", params: { id: t.id } })}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium font-sans text-foreground text-sm truncate">
                      {t.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <StatusBadge status={t.status} />
                      <FormatBadge format={t.format} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                    <Calendar size={11} />
                    {formatDate(t.date)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-sans truncate">
                    <MapPin size={11} />
                    <span className="truncate">{t.location}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Player</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="font-sans text-sm">Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-sm">Handicap (0–54)</Label>
              <Input
                type="number"
                min={0}
                max={54}
                value={editForm.handicap}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, handicap: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
