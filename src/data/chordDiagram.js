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

const CUSTOM_POSITION = {
  CM7: { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], barres: [], baseFret: 1 },
  Db: aShape("major", 4), DbM7: aShape("maj7", 4), Db7: aShape("7", 4),
  "C#m": aShape("minor", 4), "C#m7": aShape("m7", 4), Dbsus4: aShape("sus4", 4),
  Eb: aShape("major", 6), EbM7: aShape("maj7", 6), Eb7: aShape("7", 6),
  Ebm: aShape("minor", 6), Ebm7: aShape("m7", 6), Ebsus4: aShape("sus4", 6),
  B: aShape("major", 2), BM7: aShape("maj7", 2), Bm: aShape("minor", 2),
  Bm7: aShape("m7", 2), Bsus4: aShape("sus4", 2),
};

export function getChordDiagram(name) {
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
