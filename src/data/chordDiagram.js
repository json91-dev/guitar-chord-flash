import guitarChords from "@tombatossals/chords-db/lib/guitar.json";
import { parseChordName } from "./chordName.js";

const ENHARMONIC = { Db: "Csharp", "C#": "Csharp", Gb: "Fsharp", "F#": "Fsharp", "G#": "Ab" };
const SUFFIX_MAP = { "": "major", "7": "7", m: "minor", m7: "m7", M7: "maj7", dim: "dim", sus4: "sus4", add9: "add9" };

const POSITION_OVERRIDE = {
  Cm: 1, Cm7: 1, Gm: 1, Ab: 1, Ab7: 1, Absus4: 1, Cdim: 1, Gdim: 1, Bdim: 1,
};

const A_SHAPE = {
  major: { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1] },
  minor: { frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1] },
  "7": { frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1] },
  m7: { frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1] },
  maj7: { frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1] },
  sus4: { frets: [-1, 1, 3, 3, 4, 1], fingers: [0, 1, 2, 3, 4, 1] },
};
const aShape = (kind, baseFret) => ({ ...A_SHAPE[kind], barres: [1], baseFret });

const E_SHAPE = {
  major: { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] },
  minor: { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1] },
  "7": { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1] },
  m7: { frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1] },
  maj7: { frets: [1, -1, 2, 2, 1, -1], fingers: [1, 0, 3, 4, 1, 0] },
};
const eShape = (kind, baseFret) => ({ ...E_SHAPE[kind], barres: [1], baseFret });

// Movable barre voicings for the "하이코드 (바레)" view (names also exist as open chords).
export const BARRE_POSITION = {
  C: aShape("major", 3), C7: aShape("7", 3), CM7: aShape("maj7", 3),
  D: aShape("major", 5), Dm: aShape("minor", 5), D7: aShape("7", 5),
  Dm7: aShape("m7", 5), DM7: aShape("maj7", 5),
  E: aShape("major", 7), Em: aShape("minor", 7), E7: aShape("7", 7),
  Em7: aShape("m7", 7), EM7: aShape("maj7", 7),
  B7: aShape("7", 2),
  A: eShape("major", 5), Am: eShape("minor", 5), A7: eShape("7", 5),
  Am7: eShape("m7", 5), AM7: eShape("maj7", 5),
  G: eShape("major", 3), G7: eShape("7", 3), GM7: eShape("maj7", 3),
  F: eShape("major", 1), FM7: eShape("maj7", 1),
};

const CUSTOM_POSITION = {
  CM7: { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], barres: [], baseFret: 1 },
  Db: aShape("major", 4), DbM7: aShape("maj7", 4), Db7: aShape("7", 4),
  "C#m": aShape("minor", 4), "C#m7": aShape("m7", 4), Dbsus4: aShape("sus4", 4),
  Eb: aShape("major", 6), EbM7: aShape("maj7", 6), Eb7: aShape("7", 6),
  Ebm: aShape("minor", 6), Ebm7: aShape("m7", 6), Ebsus4: aShape("sus4", 6),
  B: aShape("major", 2), BM7: aShape("maj7", 2), Bm: aShape("minor", 2),
  Bm7: aShape("m7", 2), Bsus4: aShape("sus4", 2),
};

// Movable dim / sus4 / add9 voicings for the barre view.
const shapeAt = (def, baseFret, barres = []) => ({ ...def, barres, baseFret });
const DIM_A = { frets: [-1, 1, 2, 3, 2, -1], fingers: [0, 1, 2, 4, 3, 0] };
const DIM_D = { frets: [-1, -1, 1, 2, 4, 2], fingers: [0, 0, 1, 2, 4, 3] };
const ADD9_A = { frets: [-1, 2, 1, -1, 2, 2], fingers: [0, 2, 1, 0, 3, 4] };
const ADD9_D = { frets: [-1, -1, 3, 2, 1, 3], fingers: [0, 0, 3, 2, 1, 4] };
const E_SUS4 = { frets: [1, 3, 3, 3, 1, 1], fingers: [1, 3, 3, 3, 1, 1] };

// Root fret on the A string (B..E) and on the low E / D strings (F..Bb).
const A_STRING_ROOT = { B: 2, C: 3, Db: 4, D: 5, Eb: 6, E: 7 };
const LOW_E_ROOT = { F: 1, Gb: 2, G: 3, Ab: 4, A: 5, Bb: 6 };
const D_STRING_ROOT = { F: 3, Gb: 4, G: 5, Ab: 6, A: 7, Bb: 8 };

for (const [root, fret] of Object.entries(A_STRING_ROOT)) {
  BARRE_POSITION[`${root}dim`] = shapeAt(DIM_A, fret);
  BARRE_POSITION[`${root}sus4`] = aShape("sus4", fret);
  BARRE_POSITION[`${root}add9`] = shapeAt(ADD9_A, fret - 1);
}
for (const [root, fret] of Object.entries(LOW_E_ROOT)) {
  BARRE_POSITION[`${root}sus4`] = shapeAt(E_SUS4, fret, [1]);
  BARRE_POSITION[`${root}dim`] = shapeAt(DIM_D, D_STRING_ROOT[root]);
  BARRE_POSITION[`${root}add9`] = shapeAt(ADD9_D, D_STRING_ROOT[root] - 2);
}

export function getChordDiagram(name, variant) {
  if (variant === "barre" && BARRE_POSITION[name]) return { chord: BARRE_POSITION[name] };
  const parsed = parseChordName(name);
  if (!parsed) return null;
  const dbKey = ENHARMONIC[parsed.root] || parsed.root;
  const suffix = SUFFIX_MAP[parsed.rest];
  if (suffix === undefined) return null;

  const entries = guitarChords.chords[dbKey];
  if (!entries) return null;
  const chordEntry = entries.find((c) => c.suffix === suffix);
  if (!chordEntry) return null;

  return { chord: CUSTOM_POSITION[name] ?? chordEntry.positions[POSITION_OVERRIDE[name] ?? 0] };
}
