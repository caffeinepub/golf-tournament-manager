import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "./context/AppContext";
import { BottomNav } from "./components/BottomNav";
import { SeedData } from "./components/SeedData";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";
import Leaderboard from "./pages/Leaderboard";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <AppProvider>
      <SeedData />
      <div className="min-h-screen bg-background">
        <Outlet />
        <BottomNav />
      </div>
      <Toaster richColors position="top-center" />
    </AppProvider>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const tournamentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tournaments",
  component: Tournaments,
});

const tournamentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tournaments/$id",
  component: TournamentDetail,
});

const playersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/players",
  component: Players,
});

const playerDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/players/$id",
  component: PlayerDetail,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: Leaderboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  tournamentsRoute,
  tournamentDetailRoute,
  playersRoute,
  playerDetailRoute,
  leaderboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
