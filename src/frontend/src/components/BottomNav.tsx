import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart2, Home, LogOut, Trophy, Users } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tournaments", label: "Tournois", icon: Trophy },
  { to: "/players", label: "Joueurs", icon: Users },
  { to: "/leaderboard", label: "Classement", icon: BarChart2 },
] as const;

function UserAvatar({ username }: { username: string }) {
  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
      <span className="text-primary-foreground text-[10px] font-bold font-sans leading-none">
        {initials || "?"}
      </span>
    </div>
  );
}

export function BottomNav() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const { userProfile, logout, isAuthenticated } = useAuthContext();

  const displayName = userProfile?.username ?? "Joueur";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      style={{
        height: "64px",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="max-w-md mx-auto h-full flex items-stretch">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/" ? pathname === "/" : pathname.startsWith(to);

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

        {/* User profile / logout */}
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Profil utilisateur"
              >
                <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200">
                  <UserAvatar username={displayName} />
                  <span className="text-[10px] font-medium leading-none font-sans tracking-wide opacity-70 max-w-[48px] truncate">
                    {displayName.split(" ")[0]}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              className="mb-2 min-w-[180px]"
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-semibold font-sans text-foreground truncate">
                  {displayName}
                </p>
                {userProfile?.email && (
                  <p className="text-xs text-muted-foreground font-sans truncate mt-0.5">
                    {userProfile.email}
                  </p>
                )}
              </div>
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer mt-1"
              >
                <LogOut size={15} className="mr-2" />
                <span className="font-sans text-sm">Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
