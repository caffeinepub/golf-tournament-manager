import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "../hooks/useActor";
import type { Player, Tournament, Score, TournamentFormat, TournamentStatus } from "../backend.d";

// Re-export types for convenience
export type { Player, Tournament, Score };
export { TournamentFormat, TournamentStatus } from "../backend.d";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AppContextValue {
  // Data
  players: Player[];
  tournaments: Tournament[];
  isLoading: boolean;

  // Tournament mutations
  createTournament: (args: {
    name: string;
    date: bigint;
    format: TournamentFormat;
    location: string;
  }) => Promise<void>;
  updateTournament: (args: {
    id: string;
    name?: string | null;
    date?: bigint | null;
    format?: TournamentFormat | null;
    status?: TournamentStatus | null;
    location?: string | null;
  }) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;

  // Player mutations
  createPlayer: (args: { name: string; handicap: number }) => Promise<void>;
  updatePlayer: (args: {
    id: string;
    name?: string | null;
    handicap?: number | null;
  }) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;

  // Registration
  registerPlayer: (tournamentId: string, playerId: string) => Promise<void>;
  removePlayer: (tournamentId: string, playerId: string) => Promise<void>;

  // Scores
  recordScore: (args: {
    tournamentId: string;
    playerId: string;
    hole: number;
    strokes: number;
  }) => Promise<void>;

  // Refetch helpers
  refetchAll: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  // ── Queries ─────────────────────────────────────────────────────────────────

  const tournamentsQuery = useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTournaments();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });

  const playersQuery = useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPlayers();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });

  // ── Invalidation helpers ───────────────────────────────────────────────────

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    queryClient.invalidateQueries({ queryKey: ["tournamentPlayers"] });
    queryClient.invalidateQueries({ queryKey: ["scores"] });
  }, [queryClient]);

  // ── Tournament mutations ───────────────────────────────────────────────────

  const createTournamentMutation = useMutation({
    mutationFn: async (args: {
      name: string;
      date: bigint;
      format: TournamentFormat;
      location: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const id = crypto.randomUUID();
      await actor.createTournament(id, args.name, args.date, args.format, args.location);
    },
    onSuccess: invalidateAll,
  });

  const updateTournamentMutation = useMutation({
    mutationFn: async (args: {
      id: string;
      name?: string | null;
      date?: bigint | null;
      format?: TournamentFormat | null;
      status?: TournamentStatus | null;
      location?: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateTournament(
        args.id,
        args.name ?? null,
        args.date ?? null,
        args.format ?? null,
        args.status ?? null,
        args.location ?? null
      );
    },
    onSuccess: invalidateAll,
  });

  const deleteTournamentMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteTournament(id);
    },
    onSuccess: invalidateAll,
  });

  // ── Player mutations ───────────────────────────────────────────────────────

  const createPlayerMutation = useMutation({
    mutationFn: async (args: { name: string; handicap: number }) => {
      if (!actor) throw new Error("No actor");
      const id = crypto.randomUUID();
      await actor.createPlayer(id, args.name, BigInt(args.handicap));
    },
    onSuccess: invalidateAll,
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async (args: {
      id: string;
      name?: string | null;
      handicap?: number | null;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.updatePlayer(
        args.id,
        args.name ?? null,
        args.handicap != null ? BigInt(args.handicap) : null
      );
    },
    onSuccess: invalidateAll,
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deletePlayer(id);
    },
    onSuccess: invalidateAll,
  });

  // ── Registration mutations ─────────────────────────────────────────────────

  const registerPlayerMutation = useMutation({
    mutationFn: async ({
      tournamentId,
      playerId,
    }: {
      tournamentId: string;
      playerId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.registerPlayerToTournament(tournamentId, playerId);
    },
    onSuccess: invalidateAll,
  });

  const removePlayerMutation = useMutation({
    mutationFn: async ({
      tournamentId,
      playerId,
    }: {
      tournamentId: string;
      playerId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.removePlayerFromTournament(tournamentId, playerId);
    },
    onSuccess: invalidateAll,
  });

  // ── Score mutations ────────────────────────────────────────────────────────

  const recordScoreMutation = useMutation({
    mutationFn: async (args: {
      tournamentId: string;
      playerId: string;
      hole: number;
      strokes: number;
    }) => {
      if (!actor) throw new Error("No actor");
      const id = crypto.randomUUID();
      await actor.recordScore(
        id,
        args.tournamentId,
        args.playerId,
        BigInt(args.hole),
        BigInt(args.strokes)
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["scores", variables.tournamentId, variables.playerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["leaderboard", variables.tournamentId],
      });
    },
  });

  // ── Value ──────────────────────────────────────────────────────────────────

  const value: AppContextValue = {
    players: playersQuery.data ?? [],
    tournaments: tournamentsQuery.data ?? [],
    isLoading: tournamentsQuery.isLoading || playersQuery.isLoading || isFetching,

    createTournament: createTournamentMutation.mutateAsync,
    updateTournament: updateTournamentMutation.mutateAsync,
    deleteTournament: deleteTournamentMutation.mutateAsync,

    createPlayer: createPlayerMutation.mutateAsync,
    updatePlayer: updatePlayerMutation.mutateAsync,
    deletePlayer: deletePlayerMutation.mutateAsync,

    registerPlayer: (tournamentId, playerId) =>
      registerPlayerMutation.mutateAsync({ tournamentId, playerId }),
    removePlayer: (tournamentId, playerId) =>
      removePlayerMutation.mutateAsync({ tournamentId, playerId }),

    recordScore: recordScoreMutation.mutateAsync,

    refetchAll: invalidateAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
