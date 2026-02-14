
export interface Player {
  id: string;
  name: string;
  number: number;
  photoUrl: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  overall: number;
  value: number;
  salary: number;
}

export interface Team {
  id: string;
  name: string;
  stadium: string;
  color: string;
  logoUrl: string;
  league: string;
  players: Player[];
  budget: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface Transfer {
  id: string;
  playerName: string;
  playerPhoto: string;
  fromTeamName: string;
  toTeamName: string;
  value: number;
  timestamp: number;
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'YELLOW' | 'RED' | 'INFO';
  teamId: string;
  description: string;
}

export type Difficulty = 'AMATEUR' | 'PROFESSIONAL' | 'WORLD_CLASS' | 'LEGENDARY';

export type GameView = 'LOGIN' | 'MAIN_MENU' | 'MATCH_3D' | 'EDITOR' | 'CAREER' | 'ONLINE' | 'SETTINGS' | 'FRIENDLY_SELECT' | 'MATCH_SETTINGS';

export type MatchType = 'CAREER' | 'FRIENDLY';

export interface CareerState {
  currentWeek: number;
  userTeamId: string;
  leagueTable: { teamId: string; points: number; played: number }[];
}

export interface MatchPhysicsSettings {
  ballGravity: number;
  ballFriction: number;
  ballBounciness: number;
  aiAggressiveness: number;
  aiPassFrequency: number;
  cameraZoom: number;
}
