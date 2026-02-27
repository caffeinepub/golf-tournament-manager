import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  // Types
  type TournamentFormat = {
    #strokePlay;
    #matchPlay;
    #stableford;
  };

  type TournamentStatus = {
    #upcoming;
    #inProgress;
    #completed;
  };

  type Tournament = {
    id : Text;
    name : Text;
    date : Time.Time;
    format : TournamentFormat;
    status : TournamentStatus;
    location : Text;
    createdAt : Time.Time;
  };

  type Player = {
    id : Text;
    name : Text;
    handicap : Nat;
    createdAt : Time.Time;
  };

  type Score = {
    id : Text;
    tournamentId : Text;
    playerId : Text;
    hole : Nat;
    strokes : Nat;
    createdAt : Time.Time;
  };

  type TournamentPlayer = {
    tournamentId : Text;
    playerId : Text;
    registeredAt : Time.Time;
  };

  // Modules for comparison (used in sorting)
  module Tournament {
    public func compare(t1 : Tournament, t2 : Tournament) : Order.Order {
      Text.compare(t1.id, t2.id);
    };
  };

  module Player {
    public func compare(p1 : Player, p2 : Player) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  module Score {
    public func compare(s1 : Score, s2 : Score) : Order.Order {
      Text.compare(s1.id, s2.id);
    };
  };

  module TournamentPlayer {
    public func compare(tp1 : TournamentPlayer, tp2 : TournamentPlayer) : Order.Order {
      switch (Text.compare(tp1.tournamentId, tp2.tournamentId)) {
        case (#equal) { Text.compare(tp1.playerId, tp2.playerId) };
        case (order) { order };
      };
    };
  };

  // Maps for storage
  let tournaments = Map.empty<Text, Tournament>();
  let players = Map.empty<Text, Player>();
  let scores = Map.empty<Text, Score>();
  let tournamentPlayers = Map.empty<Text, TournamentPlayer>();

  // Tournament CRUD
  public shared ({ caller }) func createTournament(id : Text, name : Text, date : Time.Time, format : TournamentFormat, location : Text) : async () {
    if (tournaments.containsKey(id)) { Runtime.trap("Tournament ID already exists.") };
    let tournament : Tournament = {
      id;
      name;
      date;
      format;
      status = #upcoming;
      location;
      createdAt = Time.now();
    };
    tournaments.add(id, tournament);
  };

  public shared ({ caller }) func updateTournament(id : Text, name : ?Text, date : ?Time.Time, format : ?TournamentFormat, status : ?TournamentStatus, location : ?Text) : async () {
    switch (tournaments.get(id)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        let updatedTournament : Tournament = {
          id;
          name = switch (name) { case (?newName) { newName }; case (null) { tournament.name } };
          date = switch (date) { case (?newDate) { newDate }; case (null) { tournament.date } };
          format = switch (format) { case (?newFormat) { newFormat }; case (null) { tournament.format } };
          status = switch (status) { case (?newStatus) { newStatus }; case (null) { tournament.status } };
          location = switch (location) { case (?newLocation) { newLocation }; case (null) { tournament.location } };
          createdAt = tournament.createdAt;
        };
        tournaments.add(id, updatedTournament);
      };
    };
  };

  public shared ({ caller }) func deleteTournament(id : Text) : async () {
    switch (tournaments.get(id)) {
      case (null) { Runtime.trap("Tournament does not exist") };
      case (?_) {};
    };
    tournaments.remove(id);
  };

  public query ({ caller }) func getTournament(id : Text) : async Tournament {
    switch (tournaments.get(id)) {
      case (null) { Runtime.trap("Tournament does not exist") };
      case (?tournament) { tournament };
    };
  };

  public query ({ caller }) func getAllTournaments() : async [Tournament] {
    tournaments.values().toArray().sort();
  };

  // Player CRUD
  public shared ({ caller }) func createPlayer(id : Text, name : Text, handicap : Nat) : async () {
    if (players.containsKey(id)) { Runtime.trap("Player ID already exists.") };
    let player : Player = {
      id;
      name;
      handicap;
      createdAt = Time.now();
    };
    players.add(id, player);
  };

  public shared ({ caller }) func updatePlayer(id : Text, name : ?Text, handicap : ?Nat) : async () {
    switch (players.get(id)) {
      case (null) { Runtime.trap("Player not found") };
      case (?player) {
        let updatedPlayer : Player = {
          id;
          name = switch (name) { case (?newName) { newName }; case (null) { player.name } };
          handicap = switch (handicap) { case (?newHandicap) { newHandicap }; case (null) { player.handicap } };
          createdAt = player.createdAt;
        };
        players.add(id, updatedPlayer);
      };
    };
  };

  public shared ({ caller }) func deletePlayer(id : Text) : async () {
    switch (players.get(id)) {
      case (null) { Runtime.trap("Player does not exist") };
      case (?_) {};
    };
    players.remove(id);
  };

  public query ({ caller }) func getPlayer(id : Text) : async Player {
    switch (players.get(id)) {
      case (null) { Runtime.trap("Player does not exist") };
      case (?player) { player };
    };
  };

  public query ({ caller }) func getAllPlayers() : async [Player] {
    players.values().toArray().sort();
  };

  // Tournament Player Registration
  public shared ({ caller }) func registerPlayerToTournament(tournamentId : Text, playerId : Text) : async () {
    if (tournaments.get(tournamentId) == null) { Runtime.trap("Tournament not found") };
    if (players.get(playerId) == null) { Runtime.trap("Player not found") };

    let key = tournamentId.concat("-").concat(playerId);
    if (tournamentPlayers.containsKey(key)) { Runtime.trap("Player already registered for this tournament") };

    let tp : TournamentPlayer = {
      tournamentId;
      playerId;
      registeredAt = Time.now();
    };
    tournamentPlayers.add(key, tp);
  };

  public shared ({ caller }) func removePlayerFromTournament(tournamentId : Text, playerId : Text) : async () {
    let key = tournamentId.concat("-").concat(playerId);
    switch (tournamentPlayers.get(key)) {
      case (null) { Runtime.trap("Player is not registered for this tournament") };
      case (?_) {};
    };
    tournamentPlayers.remove(key);
  };

  public query ({ caller }) func getPlayersForTournament(tournamentId : Text) : async [Player] {
    if (tournaments.get(tournamentId) == null) { Runtime.trap("Tournament not found") };
    let playersList = List.empty<Player>();

    for (tp in tournamentPlayers.values()) {
      if (tp.tournamentId == tournamentId) {
        switch (players.get(tp.playerId)) {
          case (?player) { playersList.add(player) };
          case (null) {};
        };
      };
    };

    playersList.toArray();
  };

  public query ({ caller }) func getTournamentsForPlayer(playerId : Text) : async [Tournament] {
    if (players.get(playerId) == null) { Runtime.trap("Player not found") };
    let tournamentsList = List.empty<Tournament>();

    for (tp in tournamentPlayers.values()) {
      if (tp.playerId == playerId) {
        switch (tournaments.get(tp.tournamentId)) {
          case (?tournament) { tournamentsList.add(tournament) };
          case (null) {};
        };
      };
    };

    tournamentsList.toArray();
  };

  // Score Entry and Retrieval
  public shared ({ caller }) func recordScore(id : Text, tournamentId : Text, playerId : Text, hole : Nat, strokes : Nat) : async () {
    if (hole < 1 or hole > 18) { Runtime.trap("Invalid hole number") };

    if (tournaments.get(tournamentId) == null) { Runtime.trap("Tournament not found") };
    if (players.get(playerId) == null) { Runtime.trap("Player not found") };

    let tpKey = tournamentId.concat("-").concat(playerId);
    if (tournamentPlayers.get(tpKey) == null) { Runtime.trap("Player not registered in this tournament") };

    let score : Score = {
      id;
      tournamentId;
      playerId;
      hole;
      strokes;
      createdAt = Time.now();
    };
    scores.add(id, score);
  };

  public query ({ caller }) func getScoresForPlayer(tournamentId : Text, playerId : Text) : async [Score] {
    let scoresList = List.empty<Score>();

    for (score in scores.values()) {
      if (score.tournamentId == tournamentId and score.playerId == playerId) {
        scoresList.add(score);
      };
    };

    scoresList.toArray();
  };

  // Leaderboard Calculation
  type LeaderboardEntry = {
    player : Player;
    totalGrossScore : Nat;
  };

  module LeaderboardEntry {
    public func compareByGrossScore(a : LeaderboardEntry, b : LeaderboardEntry) : Order.Order {
      Nat.compare(a.totalGrossScore, b.totalGrossScore);
    };
  };

  public query ({ caller }) func getTournamentLeaderboard(tournamentId : Text) : async [LeaderboardEntry] {
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament does not exist") };
      case (?_) {};
    };

    let leaderboard = List.empty<LeaderboardEntry>();

    for (tp in tournamentPlayers.values()) {
      if (tp.tournamentId == tournamentId) {
        switch (players.get(tp.playerId)) {
          case (?player) {
            var totalStrokes = 0;
            for (score in scores.values()) {
              if (score.tournamentId == tournamentId and score.playerId == tp.playerId) {
                totalStrokes += score.strokes;
              };
            };
            let entry : LeaderboardEntry = {
              player;
              totalGrossScore = totalStrokes;
            };
            leaderboard.add(entry);
          };
          case (null) {};
        };
      };
    };

    leaderboard.toArray().sort(LeaderboardEntry.compareByGrossScore);
  };
};
