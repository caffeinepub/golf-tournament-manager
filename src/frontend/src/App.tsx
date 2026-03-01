import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { BottomNav } from "./components/BottomNav";
import { ProfileCompletionModal } from "./components/ProfileCompletionModal";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SeedData } from "./components/SeedData";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import PlayerDetail from "./pages/PlayerDetail";
import Players from "./pages/Players";
import TournamentDetail from "./pages/TournamentDetail";
import Tournaments from "./pages/Tournaments";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <ProtectedRoute>
        <AppProvider>
          <SeedData />
          <div className="min-h-screen bg-background">
            <Outlet />
            <BottomNav />
          </div>
          <ProfileCompletionModal />
        </AppProvider>
      </ProtectedRoute>
      <Toaster richColors position="top-center" />
    </AuthProvider>
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
