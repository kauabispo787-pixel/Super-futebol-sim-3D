
import { Team, Player } from './types';

const generatePlayers = (prefix: string, count: number): Player[] => {
  const positions: ('GK' | 'DEF' | 'MID' | 'FWD')[] = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-p-${i}-${Math.random()}`,
    name: `${prefix} Craque ${i + 1}`,
    number: i + 1,
    photoUrl: `https://i.pravatar.cc/150?u=${prefix}${i}`,
    position: positions[i % positions.length],
    overall: 70 + Math.floor(Math.random() * 20),
    value: 500000 + Math.floor(Math.random() * 10000000),
    salary: 10000 + Math.floor(Math.random() * 50000),
  }));
};

const createTeam = (id: string, name: string, stadium: string, color: string, league: string): Team => ({
  id,
  name,
  stadium,
  color,
  logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
  league,
  players: generatePlayers(id.toUpperCase(), 18),
  budget: 50000000,
  wins: 0, draws: 0, losses: 0
});

export const INITIAL_TEAMS: Team[] = [
  // BRASILEIRÃO 26/27 - SÉRIE A (Exemplos principais)
  createTeam('san', 'Santos FC', 'Vila Belmiro', '#ffffff', 'Brasileirão Série A'),
  createTeam('fla', 'Flamengo', 'Maracanã', '#ff0000', 'Brasileirão Série A'),
  createTeam('pal', 'Palmeiras', 'Allianz Parque', '#008000', 'Brasileirão Série A'),
  createTeam('spfc', 'São Paulo', 'Morumbi', '#ff0000', 'Brasileirão Série A'),
  createTeam('cor', 'Corinthians', 'Neo Química Arena', '#ffffff', 'Brasileirão Série A'),
  createTeam('flu', 'Fluminense', 'Maracanã', '#800000', 'Brasileirão Série A'),
  createTeam('gre', 'Grêmio', 'Arena do Grêmio', '#00adef', 'Brasileirão Série A'),
  createTeam('int', 'Internacional', 'Beira-Rio', '#ed1c24', 'Brasileirão Série A'),
  createTeam('atmg', 'Atlético Mineiro', 'Arena MRV', '#000000', 'Brasileirão Série A'),
  createTeam('cru', 'Cruzeiro', 'Mineirão', '#0000ff', 'Brasileirão Série A'),
  createTeam('bot', 'Botafogo', 'Nilton Santos', '#000000', 'Brasileirão Série A'),
  createTeam('vas', 'Vasco da Gama', 'São Januário', '#000000', 'Brasileirão Série A'),
  createTeam('bah', 'Bahia', 'Arena Fonte Nova', '#0000ff', 'Brasileirão Série A'),
  createTeam('for', 'Fortaleza', 'Castelão', '#0000ff', 'Brasileirão Série A'),

  // PREMIER LEAGUE
  createTeam('manc', 'Manchester City', 'Etihad Stadium', '#6caddf', 'Premier League'),
  createTeam('liv', 'Liverpool', 'Anfield', '#c8102e', 'Premier League'),
  createTeam('ars', 'Arsenal', 'Emirates Stadium', '#ef0107', 'Premier League'),
  createTeam('mnu', 'Manchester United', 'Old Trafford', '#da291c', 'Premier League'),
  createTeam('che', 'Chelsea', 'Stamford Bridge', '#034694', 'Premier League'),

  // LA LIGA
  createTeam('rma', 'Real Madrid', 'Santiago Bernabéu', '#ffffff', 'La Liga'),
  createTeam('bar', 'FC Barcelona', 'Camp Nou', '#004d98', 'La Liga'),
  createTeam('atm', 'Atlético de Madrid', 'Metropolitano', '#cb3524', 'La Liga'),

  // BUNDESLIGA
  createTeam('bay', 'Bayern München', 'Allianz Arena', '#dc052d', 'Bundesliga'),
  createTeam('dor', 'Borussia Dortmund', 'Signal Iduna Park', '#fde100', 'Bundesliga'),
  createTeam('lev', 'Bayer Leverkusen', 'BayArena', '#e32221', 'Bundesliga'),

  // SERIE A TIM
  createTeam('juv', 'Juventus', 'Allianz Stadium', '#ffffff', 'Serie A (ITA)'),
  createTeam('intm', 'Inter de Milão', 'San Siro', '#0066b2', 'Serie A (ITA)'),
  createTeam('acm', 'AC Milan', 'San Siro', '#fb090b', 'Serie A (ITA)'),

  // LIGUE 1
  createTeam('psg', 'Paris Saint-Germain', 'Parc des Princes', '#004170', 'Ligue 1'),
];

export const LIGUES = Array.from(new Set(INITIAL_TEAMS.map(t => t.league)));

export const DANDAN_PHRASES = [
  "Chegou o momento, o jogo vai começar!",
  "É GOOOOOOOOOL! TÁ LÁ DENTRO! É REDE!",
  "Que beleza de jogada, rapaz!",
  "Olha o que ele fez! Esculachou!",
  "O juiz apita, fim de papo! E o que é que eu vou dizer lá em casa?",
  "A bola tá rolando!",
  "Espalma o goleiro, que beleza!",
  "Bateu de chapa!",
  "Tá em casa!",
  "Que venha o segundo tempo!"
];
