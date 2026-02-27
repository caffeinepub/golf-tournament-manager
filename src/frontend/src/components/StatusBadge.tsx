import { TournamentStatus, TournamentFormat } from "../context/AppContext";

interface StatusBadgeProps {
  status: TournamentStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = {
    [TournamentStatus.upcoming]: {
      label: "Upcoming",
      classes: "bg-blue-50 text-blue-700 border border-blue-200",
    },
    [TournamentStatus.inProgress]: {
      label: "In Progress",
      classes: "bg-green-50 text-green-700 border border-green-200",
      dot: true,
    },
    [TournamentStatus.completed]: {
      label: "Completed",
      classes: "bg-gray-100 text-gray-600 border border-gray-200",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-sans ${config.classes} ${className}`}
    >
      {"dot" in config && config.dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-pulse" />
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
