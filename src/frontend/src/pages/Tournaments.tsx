import { useState } from "react";
import { Plus, Trophy } from "lucide-react";
// No router imports needed - all navigation is done from child components
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAppContext, TournamentStatus, TournamentFormat } from "../context/AppContext";
import { TournamentCard } from "../components/TournamentCard";
import { PageHeader } from "../components/PageHeader";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: TournamentStatus.inProgress, label: "Live" },
  { key: TournamentStatus.upcoming, label: "Upcoming" },
  { key: TournamentStatus.completed, label: "Done" },
] as const;

type TabKey = (typeof STATUS_TABS)[number]["key"];

interface TournamentFormData {
  name: string;
  date: string;
  location: string;
  format: TournamentFormat;
}

const DEFAULT_FORM: TournamentFormData = {
  name: "",
  date: new Date().toISOString().slice(0, 10),
  location: "",
  format: TournamentFormat.strokePlay,
};

export default function Tournaments() {
  const { tournaments, isLoading, createTournament } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<TournamentFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = tournaments.filter((t) => {
    if (activeTab === "all") return true;
    return t.status === activeTab;
  });

  // Sort: inProgress first, then upcoming, then completed
  const statusOrder: Record<TournamentStatus, number> = {
    [TournamentStatus.inProgress]: 0,
    [TournamentStatus.upcoming]: 1,
    [TournamentStatus.completed]: 2,
  };
  const sorted = [...filtered].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const dateMs = new Date(form.date).getTime();
      await createTournament({
        name: form.name.trim(),
        date: BigInt(dateMs) * 1_000_000n,
        format: form.format,
        location: form.location.trim(),
      });
      toast.success("Tournament created!");
      setShowCreate(false);
      setForm(DEFAULT_FORM);
    } catch {
      toast.error("Failed to create tournament");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen pb-nav bg-background">
      <PageHeader title="Tournaments" />

      {/* Filter tabs */}
      <div className="sticky top-[72px] z-30 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.key === "all"
                  ? tournaments.length
                  : tournaments.filter((t) => t.status === tab.key).length;

              return (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "flex items-center gap-1.5 px-4 py-3 text-sm font-medium font-sans whitespace-nowrap border-b-2 transition-colors",
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {tab.label}
                  <span
                    className={[
                      "text-xs px-1.5 py-0.5 rounded-full",
                      activeTab === tab.key
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <div className="space-y-3 stagger-children">
            {sorted.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Trophy
              size={48}
              className="text-muted-foreground mx-auto mb-4 opacity-40"
            />
            <h3 className="text-lg font-bold font-serif text-foreground mb-2">
              No tournaments found
            </h3>
            <p className="text-muted-foreground text-sm font-sans">
              {activeTab === "all"
                ? "Create your first tournament"
                : `No ${activeTab === TournamentStatus.inProgress ? "live" : activeTab} tournaments`}
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="fixed right-4 bottom-[80px] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all z-40"
        aria-label="Create tournament"
      >
        <Plus size={24} />
      </button>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="font-serif">New Tournament</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="t-name" className="font-sans text-sm">
                Tournament Name *
              </Label>
              <Input
                id="t-name"
                placeholder="e.g. Summer Championship"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-location" className="font-sans text-sm">
                Location *
              </Label>
              <Input
                id="t-location"
                placeholder="e.g. Pebble Beach Golf Links"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-date" className="font-sans text-sm">
                Date *
              </Label>
              <Input
                id="t-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-sm">Format *</Label>
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
                {saving ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
