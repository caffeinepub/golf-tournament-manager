import { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
  variant?: "default" | "green";
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
  variant = "green",
}: PageHeaderProps) {
  const navigate = useNavigate();

  const isGreen = variant === "green";

  return (
    <header
      className={[
        "sticky top-0 z-40",
        isGreen ? "header-gradient text-white" : "bg-card border-b border-border",
      ].join(" ")}
    >
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          {backHref && (
            <Button
              variant="ghost"
              size="icon"
              className={[
                "shrink-0 -ml-2 rounded-full",
                isGreen
                  ? "text-white/80 hover:text-white hover:bg-white/15"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
              onClick={() => void navigate({ to: backHref as "/" })}
              aria-label="Go back"
            >
              <ChevronLeft size={22} />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1
              className={[
                "text-xl font-bold font-serif truncate leading-tight",
                isGreen ? "text-white" : "text-foreground",
              ].join(" ")}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={[
                  "text-sm mt-0.5 truncate font-sans",
                  isGreen ? "text-white/70" : "text-muted-foreground",
                ].join(" ")}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </header>
  );
}
