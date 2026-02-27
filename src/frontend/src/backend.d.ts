import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: string;
    name: string;
    createdAt: Time;
    handicap: bigint;
}
export interface LeaderboardEntry {
    player: Player;
    totalGrossScore: bigint;
}
export type Time = bigint;
export interface Score {
    id: string;
    hole: bigint;
    playerId: string;
    createdAt: Time;
    tournamentId: string;
    strokes: bigint;
}
export interface Tournament {
    id: string;
    status: TournamentStatus;
    date: Time;
    name: string;
    createdAt: Time;
    location: string;
    format: TournamentFormat;
}
export enum TournamentFormat {
    matchPlay = "matchPlay",
    stableford = "stableford",
    strokePlay = "strokePlay"
}
export enum TournamentStatus {
    upcoming = "upcoming",
    completed = "completed",
    inProgress = "inProgress"
}
export interface backendInterface {
    createPlayer(id: string, name: string, handicap: bigint): Promise<void>;
    createTournament(id: string, name: string, date: Time, format: TournamentFormat, location: string): Promise<void>;
    deletePlayer(id: string): Promise<void>;
    deleteTournament(id: string): Promise<void>;
    getAllPlayers(): Promise<Array<Player>>;
    getAllTournaments(): Promise<Array<Tournament>>;
    getPlayer(id: string): Promise<Player>;
    getPlayersForTournament(tournamentId: string): Promise<Array<Player>>;
    getScoresForPlayer(tournamentId: string, playerId: string): Promise<Array<Score>>;
    getTournament(id: string): Promise<Tournament>;
    getTournamentLeaderboard(tournamentId: string): Promise<Array<LeaderboardEntry>>;
    getTournamentsForPlayer(playerId: string): Promise<Array<Tournament>>;
    recordScore(id: string, tournamentId: string, playerId: string, hole: bigint, strokes: bigint): Promise<void>;
    registerPlayerToTournament(tournamentId: string, playerId: string): Promise<void>;
    removePlayerFromTournament(tournamentId: string, playerId: string): Promise<void>;
    updatePlayer(id: string, name: string | null, handicap: bigint | null): Promise<void>;
    updateTournament(id: string, name: string | null, date: Time | null, format: TournamentFormat | null, status: TournamentStatus | null, location: string | null): Promise<void>;
}
