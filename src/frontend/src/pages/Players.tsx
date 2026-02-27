import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Users, ChevronRight, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PageHeader } from "../components/PageHeader";

interface PlayerFormData {
  name: string;
  handicap: string;
}

const DEFAULT_FORM: PlayerFormData = { name: "", handicap: "" };

export default function Players() {
  const navigate = useNavigate();
  const { players, isLoading, createPlayer } = useAppContext();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<PlayerFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? players.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : players;

  // Sort alphabetically
  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const hcp = parseInt(form.handicap);
    if (!form.name.trim()) {
      toast.error("Please enter a player name");
      return;
    }
    if (isNaN(hcp) || hcp < 0 || hcp > 54) {
      toast.error("Handicap must be between 0 and 54");
      return;
    }
    setSaving(true);
    try {
      await createPlayer({ name: form.name.trim(), handicap: hcp });
      toast.success("Player added!");
      setShowCreate(false);
      setForm(DEFAULT_FORM);
    } catch {
      toast.error("Failed to add player");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen pb-nav bg-background">
      <PageHeader title="Players" subtitle={`${players.length} registered`} />

      {/* Search */}
      <div className="sticky top-[72px] z-30 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Search players..."
              className="pl-9 font-sans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <div className="space-y-2 stagger-children">
            {sorted.map((player) => (
              <button
                type="button"
                key={player.id}
                className="w-full flex items-center gap-3 bg-card rounded-xl p-3 border border-border hover:shadow-card-hover transition-all text-left active:scale-[0.99]"
                onClick={() => void navigate({ to: "/players/$id", params: { id: player.id } })}
              >
                <PlayerAvatar name={player.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium font-sans text-foreground truncate">
                    {player.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans">
                    Handicap {Number(player.handicap)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold font-sans bg-secondary/60 text-secondary-foreground px-2 py-1 rounded-full">
                    HCP {Number(player.handicap)}
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users
              size={48}
              className="text-muted-foreground mx-auto mb-4 opacity-40"
            />
            <h3 className="text-lg font-bold font-serif text-foreground mb-2">
              {search ? "No players found" : "No players yet"}
            </h3>
            <p className="text-sm text-muted-foreground font-sans">
              {search ? "Try a different search" : "Add your first player"}
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="fixed right-4 bottom-[80px] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all z-40"
        aria-label="Add player"
      >
        <Plus size={24} />
      </button>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Player</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-name" className="font-sans text-sm">
                Full Name *
              </Label>
              <Input
                id="p-name"
                placeholder="e.g. John Smith"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-hcp" className="font-sans text-sm">
                Handicap (0–54) *
              </Label>
              <Input
                id="p-hcp"
                type="number"
                min={0}
                max={54}
                placeholder="e.g. 12"
                value={form.handicap}
                onChange={(e) => setForm((f) => ({ ...f, handicap: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Adding..." : "Add Player"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
