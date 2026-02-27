import { useEffect, useRef } from "react";
import { useActor } from "../hooks/useActor";
import { useAppContext, TournamentFormat, TournamentStatus } from "../context/AppContext";
import { useQueryClient } from "@tanstack/react-query";

const SEED_KEY = "golf-app-seeded-v1";

// Mock players
const MOCK_PLAYERS = [
  { name: "James Wilson", handicap: 12 },
  { name: "Sarah Mitchell", handicap: 8 },
  { name: "Tom Bradley", handicap: 18 },
  { name: "Emma Clarke", handicap: 5 },
  { name: "Michael Torres", handicap: 22 },
  { name: "Lisa Park", handicap: 14 },
  { name: "David Chen", handicap: 3 },
  { name: "Rachel Adams", handicap: 16 },
];

// Scores for Summer Club Championship (inProgress) - holes 1-9
const CHAMPIONSHIP_SCORES: Record<string, number[]> = {
  "David Chen": [4, 3, 4, 5, 3, 4, 4, 3, 4],
  "Emma Clarke": [4, 4, 5, 4, 4, 3, 5, 4, 4],
  "Sarah Mitchell": [4, 4, 5, 4, 5, 4, 4, 3, 5],
  "James Wilson": [5, 4, 5, 5, 4, 5, 4, 4, 5],
  "Lisa Park": [5, 5, 4, 5, 4, 5, 5, 4, 5],
  "Tom Bradley": [5, 5, 6, 5, 5, 5, 5, 4, 6],
  "Rachel Adams": [5, 5, 6, 5, 5, 6, 5, 4, 5],
  "Michael Torres": [6, 5, 6, 6, 5, 6, 5, 5, 6],
};

// Full 18-hole scores for Spring Open (completed) - first 6 players
const SPRING_OPEN_SCORES: Record<string, number[]> = {
  "James Wilson": [5, 4, 5, 5, 4, 5, 4, 4, 5, 5, 4, 5, 5, 4, 5, 4, 4, 5],
  "Sarah Mitchell": [4, 4, 5, 4, 5, 4, 4, 3, 5, 4, 4, 5, 4, 4, 4, 4, 3, 5],
  "Tom Bradley": [5, 5, 6, 5, 5, 5, 5, 4, 6, 5, 5, 6, 5, 5, 5, 5, 4, 6],
  "Emma Clarke": [4, 4, 4, 4, 4, 3, 5, 4, 4, 4, 4, 4, 4, 3, 4, 5, 4, 4],
  "Michael Torres": [6, 5, 6, 6, 5, 6, 5, 5, 6, 6, 5, 6, 5, 5, 6, 5, 5, 6],
  "Lisa Park": [5, 5, 4, 5, 4, 5, 5, 4, 5, 5, 5, 4, 5, 4, 5, 5, 4, 5],
};

function nowNs(): bigint {
  return BigInt(Date.now()) * 1_000_000n;
}

function daysFromNowNs(days: number): bigint {
  return BigInt(Date.now() + days * 24 * 60 * 60 * 1000) * 1_000_000n;
}

export function SeedData() {
  const { actor, isFetching } = useActor();
  const { tournaments } = useAppContext();
  const queryClient = useQueryClient();
  const hasSeeded = useRef(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    if (hasSeeded.current) return;
    if (sessionStorage.getItem(SEED_KEY)) return;
    // Wait for tournaments to load
    if (tournaments === undefined) return;

    // Only seed if no tournaments exist
    if (tournaments.length > 0) {
      sessionStorage.setItem(SEED_KEY, "1");
      return;
    }

    hasSeeded.current = true;
    sessionStorage.setItem(SEED_KEY, "1");

    void (async () => {
      try {
        // 1. Create players
        const playerIds: Record<string, string> = {};
        await Promise.all(
          MOCK_PLAYERS.map(async (p) => {
            const id = crypto.randomUUID();
            playerIds[p.name] = id;
            await actor.createPlayer(id, p.name, BigInt(p.handicap));
          })
        );

        // 2. Create tournaments
        const champId = crypto.randomUUID();
        const stablefordId = crypto.randomUUID();
        const springId = crypto.randomUUID();

        await Promise.all([
          actor.createTournament(
            champId,
            "Summer Club Championship",
            nowNs(),
            TournamentFormat.strokePlay,
            "Pebble Beach Golf Links"
          ),
          actor.createTournament(
            stablefordId,
            "Stableford Monthly",
            daysFromNowNs(14),
            TournamentFormat.stableford,
            "Augusta National"
          ),
          actor.createTournament(
            springId,
            "Spring Open",
            daysFromNowNs(-30),
            TournamentFormat.strokePlay,
            "St Andrews Links"
          ),
        ]);

        // 3. Update statuses (default is upcoming, need to set inProgress and completed)
        await Promise.all([
          actor.updateTournament(
            champId,
            null,
            null,
            null,
            TournamentStatus.inProgress,
            null
          ),
          actor.updateTournament(
            springId,
            null,
            null,
            null,
            TournamentStatus.completed,
            null
          ),
        ]);

        // 4. Register players to Summer Club Championship (all 8)
        await Promise.all(
          Object.values(playerIds).map((pid) =>
            actor.registerPlayerToTournament(champId, pid)
          )
        );

        // 5. Record scores for Summer Club Championship (holes 1-9)
        const champScorePromises: Promise<void>[] = [];
        for (const [playerName, scores] of Object.entries(CHAMPIONSHIP_SCORES)) {
          const pid = playerIds[playerName];
          if (!pid) continue;
          for (let i = 0; i < scores.length; i++) {
            const scoreId = crypto.randomUUID();
            champScorePromises.push(
              actor.recordScore(scoreId, champId, pid, BigInt(i + 1), BigInt(scores[i]))
            );
          }
        }
        await Promise.all(champScorePromises);

        // 6. Register first 6 players to Spring Open
        const springPlayers = [
          "James Wilson",
          "Sarah Mitchell",
          "Tom Bradley",
          "Emma Clarke",
          "Michael Torres",
          "Lisa Park",
        ];
        await Promise.all(
          springPlayers.map((name) =>
            actor.registerPlayerToTournament(springId, playerIds[name])
          )
        );

        // 7. Record full 18-hole scores for Spring Open
        const springScorePromises: Promise<void>[] = [];
        for (const [playerName, scores] of Object.entries(SPRING_OPEN_SCORES)) {
          const pid = playerIds[playerName];
          if (!pid) continue;
          for (let i = 0; i < scores.length; i++) {
            const scoreId = crypto.randomUUID();
            springScorePromises.push(
              actor.recordScore(scoreId, springId, pid, BigInt(i + 1), BigInt(scores[i]))
            );
          }
        }
        await Promise.all(springScorePromises);

        // 8. Invalidate queries to show fresh data
        queryClient.invalidateQueries({ queryKey: ["tournaments"] });
        queryClient.invalidateQueries({ queryKey: ["players"] });
      } catch (err) {
        console.error("Seed error:", err);
        hasSeeded.current = false;
        sessionStorage.removeItem(SEED_KEY);
      }
    })();
  }, [actor, isFetching, tournaments, queryClient]);

  return null;
}
