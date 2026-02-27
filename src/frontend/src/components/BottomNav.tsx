import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Trophy, Users, BarChart2 } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/players", label: "Players", icon: Users },
  { to: "/leaderboard", label: "Leaderboard", icon: BarChart2 },
] as const;

export function BottomNav() {
  const { location } = useRouterState();
  const pathname = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      style={{ height: "64px", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="max-w-md mx-auto h-full flex items-stretch">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/"
              ? pathname === "/"
              : pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
              aria-label={label}
            >
              <div
                className={[
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-200"
                />
                <span
                  className={[
                    "text-[10px] font-medium leading-none font-sans tracking-wide transition-all duration-200",
                    isActive ? "opacity-100" : "opacity-70",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
