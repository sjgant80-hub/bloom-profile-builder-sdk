// @ai-native-solutions/bloom-profile-builder-sdk · TypeScript declarations

export type RingIdx = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Ring {
  idx: RingIdx;
  glyph: string;
  name: string;
  prime: number;
  desc: string;
  orphan?: boolean;
}
export const RINGS: readonly Ring[];

export const SPINE:        readonly number[];
export const SPINE_GLYPHS: readonly string[];
export const SPINE_NAMES:  readonly string[];

export interface Probe { ring: RingIdx; q: string; note: string; }
export const PROBES: readonly Probe[];

export interface LikertOption { v: 0 | 1 | 2 | 3; lab: string; }
export const LIKERT: readonly LikertOption[];

export const PROBE_COUNT:     number;
export const PROBES_PER_RING: number;

export interface ProbeMeta { idx: number; ring: RingIdx; glyph: string; name: string; q: string; note: string; }
export function probeAt(idx: number): ProbeMeta | null;

export interface Answer { score: 0 | 1 | 2 | 3; text?: string; }
export interface SessionState {
  idx: number;
  answers: (Answer | null)[];
  textAll: string[];
  startedAt: string;
}
export function nextProbe(sessionState: Partial<SessionState>): ProbeMeta | null;
export function blankSession(): SessionState;

// --- scoring / fold-math ---
export const PHI:      number;
export const KAPPA:    number;
export const OMEGA:    number;
export const BASELINE: readonly number[];

export function foldNumber(S: number[]): number;
export function unfoldState(F: number): number[] | null;
export function stateSum(S: number[]): number;
export function stateSignature(S: number[]): string;

export interface KappaBand { min: number; max: number; name: string; glyph: string; ring: RingIdx; warn?: boolean; orphan?: boolean; }
export const KAPPA_BANDS: readonly KappaBand[];
export function depthBand(kappa: number): KappaBand;
export function isOrphanZone(kappa: number): boolean;

export const BAND_MARKERS: Record<string, string[]>;
export function classifyKappaBand(text: string): KappaBand;

export function accumulate(answers: (Answer | null)[]): number[];
export function ringSumsToBloom(ringSums: number[]): number[];
export function currentBloom(answers: (Answer | null)[]): number[];
export function bloomToStateVector(bloom: number[]): number[];
export function stateVectorToBloom(S: number[]): number[];
export function cumulativeText(sessionState: Partial<SessionState>): string;

export interface LiveReadings {
  bloom:       number[];
  stateVector: number[];
  foldNumber:  number;
  stateSum:    number;
  signature:   string;
  band:        KappaBand | null;
  omega:       number;
}
export function liveReadings(sessionState: SessionState): LiveReadings;

// --- profile ---
export type Shape = 'plateau' | 'spiky' | 'mountain' | 'valley' | 'ridge';
export function classifyShape(bloom: number[]): Shape;
export function growthEdge(bloom: number[]): string;
export function radialSVG(bloom: number[], size?: number): string;

export interface Profile {
  id:           string;
  createdAt:    string;
  startedAt:    string;
  bloom:        number[];
  stateVector:  number[];
  foldNumber:   number;
  omega:        number;
  signature:    string;
  stateSum:     number;
  dominantBand: { name: string; glyph: string; ring: RingIdx };
  shape:        Shape;
  growthEdge:   string;
  answers:      { ring: RingIdx; q: string; score: number | null; text: string }[];
}
export function computeProfile(sessionState: SessionState): Profile;
export function profileCard(p: Profile): string;
export function exportProfileJSON(profile: Profile, indent?: number): string;
export function importProfileJSON(jsonString: string): Profile;

// --- storage (browser only) ---
export const DB_NAME:    string;
export const DB_VERSION: number;
export const STORE:      string;
export function openDB():                     Promise<IDBDatabase>;
export function saveProfile(profile: Profile):Promise<void>;
export function getProfile(id: string):       Promise<Profile | undefined>;
export function allProfiles():                Promise<Profile[]>;
export function deleteProfile(id: string):    Promise<void>;
export function clearAll():                   Promise<void>;

// --- session helper ---
export interface AnswerResult {
  done: boolean;
  live: LiveReadings;
  next: ProbeMeta | null;
}
export interface Session {
  firstProbe():            ProbeMeta;
  currentProbe():          ProbeMeta | null;
  answer(a: Answer):       AnswerResult;
  back():                  ProbeMeta | null;
  live():                  LiveReadings;
  end():                   Profile;
  getState():              SessionState;
}
export function createSession(opts?: { startedAt?: string }): Session;

export const VERSION: string;
