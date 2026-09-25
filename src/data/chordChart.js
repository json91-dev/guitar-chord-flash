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
const ALL_ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const BASIC_COLUMNS = [
  { key: "major", title: "메이저" },
  { key: "m", title: "마이너" },
  { key: "7", title: "7th" },
  { key: "m7", title: "마이너 7th" },
  { key: "M7", title: "메이저 7th" },
];
const DIM_SUS_COLUMNS = [
  { key: "dim", title: "디미니시" },
  { key: "sus4", title: "서스4" },
  { key: "add9", title: "add9" },
];

function buildView(label, columns, rows) {
  const lines = rows.map((pitchClass) => ({
    pitchClass,
    label: ROW_LABEL[pitchClass],
    cells: columns.map((c) => CHORD_GRID[pitchClass]?.[c.key] ?? null),
  }));
  const total = lines.reduce((sum, l) => sum + l.cells.filter(Boolean).length, 0);
  return { label, columns, lines, total };
}

export const CHART_VIEWS = {
  basic: buildView("기본", BASIC_COLUMNS, NATURAL_ROWS),
  accidental: buildView("#/b 포함", BASIC_COLUMNS, ACCIDENTAL_ROWS),
  dimSus: buildView("dim·sus4·add9", DIM_SUS_COLUMNS, ALL_ROWS),
};
