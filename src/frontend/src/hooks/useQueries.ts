import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Player, Score, LeaderboardEntry } from "../backend.d";

export function usePlayersForTournament(tournamentId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ["tournamentPlayers", tournamentId],
    queryFn: async () => {
      if (!actor || !tournamentId) return [];
      return actor.getPlayersForTournament(tournamentId);
    },
    enabled: !!actor && !isFetching && !!tournamentId,
    staleTime: 30_000,
  });
}

export function useScoresForPlayer(
  tournamentId: string | undefined,
  playerId: string | undefined
) {
  const { actor, isFetching } = useActor();
  return useQuery<Score[]>({
    queryKey: ["scores", tournamentId, playerId],
    queryFn: async () => {
      if (!actor || !tournamentId || !playerId) return [];
      return actor.getScoresForPlayer(tournamentId, playerId);
    },
    enabled: !!actor && !isFetching && !!tournamentId && !!playerId,
    staleTime: 10_000,
  });
}

export function useTournamentLeaderboard(tournamentId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", tournamentId],
    queryFn: async () => {
      if (!actor || !tournamentId) return [];
      return actor.getTournamentLeaderboard(tournamentId);
    },
    enabled: !!actor && !isFetching && !!tournamentId,
    staleTime: 15_000,
  });
}

export function useTournamentsForPlayer(playerId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["playerTournaments", playerId],
    queryFn: async () => {
      if (!actor || !playerId) return [];
      return actor.getTournamentsForPlayer(playerId);
    },
    enabled: !!actor && !isFetching && !!playerId,
    staleTime: 30_000,
  });
}
