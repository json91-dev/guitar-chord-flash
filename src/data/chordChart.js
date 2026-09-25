import { lowChords, highChords } from "./chords.js";
import { parseChordName } from "./chordName.js";

const PITCH_CLASS = {
  C: 0, "C#": 1, Db: 1, D: 2, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8, A: 9, Bb: 10, B: 11,
};

const REST_TO_COLUMN = { "": "major", "7": "7", m: "m", m7: "m7", M7: "M7", dim: "dim", sus4: "sus4", add9: "add9" };

function buildChordGrid() {
  const grid = {};
  for (const [name, label] of [...lowChords, ...highChords]) {
    const parsed = parseChordName(name);
    if (!parsed) continue;
    const pitchClass = PITCH_CLASS[parsed.root];
    const column = REST_TO_COLUMN[parsed.rest];
    if (pitchClass === undefined || column === undefined) continue;
    if (!grid[pitchClass]) grid[pitchClass] = {};
    grid[pitchClass][column] = [name, label];
  }
  return grid;
}

const CHORD_GRID = buildChordGrid();

export const ROW_LABEL = {
  0: "C", 1: "Db/C#", 2: "D", 3: "Eb", 4: "E", 5: "F", 6: "Gb/F#",
  7: "G", 8: "Ab/G#", 9: "A", 10: "Bb", 11: "B",
};

const NATURAL_ROWS = [0, 2, 4, 5, 7, 9, 11];
const ACCIDENTAL_ROWS = [1, 3, 6, 8, 10];

const BASIC_COLUMNS = [
  { key: "major", title: "Major" },
  { key: "m", title: "Minor" },
  { key: "7", title: "7" },
  { key: "m7", title: "m7" },
  { key: "M7", title: "M7" },
];
const DIM_SUS_COLUMNS = [
  { key: "dim", title: "dim" },
  { key: "sus4", title: "sus4" },
  { key: "add9", title: "add9" },
];

function buildView(label, columns, rows) {
  const lines = rows.map((pitchClass) => ({
    pitchClass,
    label: ROW_LABEL[pitchClass],
    cells: columns.map((c) => CHORD_GRID[pitchClass]?.[c.key] ?? null),
  }));
  const chords = lines.flatMap((l) => l.cells.filter(Boolean));
  const total = chords.length;
  return { label, columns, lines, chords, total };
}

export const CHART_VIEWS = {
  basic: buildView("기본코드", BASIC_COLUMNS, NATURAL_ROWS),
  accidental: buildView("#,b", BASIC_COLUMNS, ACCIDENTAL_ROWS),
  dimSus: buildView("dim·sus4·add9", DIM_SUS_COLUMNS, NATURAL_ROWS),
  dimSusAccidental: buildView("dim·sus4·add9 #,b", DIM_SUS_COLUMNS, ACCIDENTAL_ROWS),
};
