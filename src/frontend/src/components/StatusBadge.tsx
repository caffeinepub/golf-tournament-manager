import { TournamentFormat, TournamentStatus } from "../context/AppContext";

interface StatusBadgeProps {
  status: TournamentStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = {
    [TournamentStatus.upcoming]: {
      label: "Upcoming",
      classes: "bg-secondary/60 text-secondary-foreground border border-border",
    },
    [TournamentStatus.inProgress]: {
      label: "In Progress",
      classes: "bg-primary/15 text-primary border border-primary/30",
      dot: true,
    },
    [TournamentStatus.completed]: {
      label: "Completed",
      classes: "bg-muted text-muted-foreground border border-border",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-sans ${config.classes} ${className}`}
    >
      {"dot" in config && config.dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary status-pulse" />
      )}
      {config.label}
    </span>
  );
}

interface FormatBadgeProps {
  format: TournamentFormat;
  className?: string;
}

export function FormatBadge({ format, className = "" }: FormatBadgeProps) {
  const config = {
    [TournamentFormat.strokePlay]: {
      label: "Stroke Play",
      classes: "bg-background text-foreground border border-border",
    },
    [TournamentFormat.matchPlay]: {
      label: "Match Play",
      classes: "bg-background text-foreground border border-border",
    },
    [TournamentFormat.stableford]: {
      label: "Stableford",
      classes: "bg-accent/20 text-accent-foreground border border-accent/30",
    },
  }[format];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-sans ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}
