import { lowChords, highChords } from "./chords.js";
import { parseChordName } from "./chordName.js";

const PITCH_CLASS = {
  C: 0, "C#": 1, Db: 1, D: 2, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8, A: 9, Bb: 10, B: 11,
};

const REST_TO_COLUMN = { "": "major", "7": "7", m: "m", m7: "m7", M7: "M7", dim: "dim", sus4: "sus4", add9: "add9" };

function buildGrid(entries) {
  const grid = {};
  for (const [name, label, tier] of entries) {
    const parsed = parseChordName(name);
    if (!parsed) continue;
    const pitchClass = PITCH_CLASS[parsed.root];
    const column = REST_TO_COLUMN[parsed.rest];
    if (pitchClass === undefined || column === undefined) continue;
    if (!grid[pitchClass]) grid[pitchClass] = {};
    grid[pitchClass][column] = [name, label, tier];
  }
  return grid;
}

const CHORD_GRID = buildGrid([
  ...lowChords.map(([name, label]) => [name, label, "low"]),
  ...highChords.map(([name, label]) => [name, label, "high"]),
]);

const BARRE_EXTRA_LABEL = { "": "major", "7": "dominant 7th", m: "minor", m7: "minor 7th", M7: "major 7th" };
const BARRE_EXTRA = [
  "C", "C7", "CM7", "D", "Dm", "D7", "Dm7", "DM7", "E", "Em", "E7", "Em7", "EM7",
  "F", "FM7", "G", "G7", "GM7", "A", "Am", "A7", "Am7", "AM7", "B7",
].map((name) => [name, BARRE_EXTRA_LABEL[parseChordName(name).rest]]);

const SPECIAL_ROOTS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const SPECIAL_LABEL = { dim: "diminished", sus4: "suspended 4th", add9: "add9" };
const SPECIAL_BARRE = SPECIAL_ROOTS.flatMap((root) =>
  Object.entries(SPECIAL_LABEL).map(([kind, label]) => [`${root}${kind}`, label])
);

const OPEN_SPECIAL = new Set([
  "Csus4", "Cadd9", "Ddim", "Dsus4", "Esus4", "Eadd9",
  "Gsus4", "Gadd9", "Adim", "Asus4", "Aadd9",
]);

const BARRE_GRID = buildGrid(
  [...highChords, ...BARRE_EXTRA, ...SPECIAL_BARRE].map(([name, label]) => [name, `${label} · barre`, "barre"])
);

export const ROW_LABEL = {
  0: "C", 1: "Db/C#", 2: "D", 3: "Eb", 4: "E", 5: "F", 6: "Gb/F#",
  7: "G", 8: "Ab/G#", 9: "A", 10: "Bb", 11: "B",
};

const NATURAL_ROWS = [0, 2, 4, 5, 7, 9, 11];
const ACCIDENTAL_ROWS = [1, 3, 6, 8, 10];
const ALL_ROWS = [...NATURAL_ROWS, ...ACCIDENTAL_ROWS].sort((a, b) => a - b);

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

function buildView(label, columns, rows, filter, grid = CHORD_GRID) {
  const lines = rows
    .map((pitchClass) => ({
      pitchClass,
      label: ROW_LABEL[pitchClass],
      cells: columns.map((c) => {
        const cell = grid[pitchClass]?.[c.key] ?? null;
        return cell && (!filter || filter(cell)) ? cell : null;
      }),
    }))
    .filter((line) => !filter || line.cells.some(Boolean));
  const chords = lines.flatMap((l) => l.cells.filter(Boolean));
  const total = chords.length;
  return { label, columns, lines, chords, total };
}

export const CHART_VIEWS = {
  basic: buildView("기본코드", BASIC_COLUMNS, NATURAL_ROWS, (cell) => cell[2] === "low"),
  barre: buildView("하이코드 (바레)", BASIC_COLUMNS, ALL_ROWS, undefined, BARRE_GRID),
  dimSusOpen: buildView("dim·sus4·add9 (오픈)", DIM_SUS_COLUMNS, NATURAL_ROWS, (cell) => OPEN_SPECIAL.has(cell[0])),
  dimSusBarre: buildView("dim·sus4·add9 (바레)", DIM_SUS_COLUMNS, ALL_ROWS, undefined, BARRE_GRID),
};
