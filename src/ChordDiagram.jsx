import { getChordDiagram } from "./data/chordDiagram.js";

const FRETS = 4;
const STRINGS = 6;
const NUT_X = 18;
const CELL_W = 26;
const ROW_H = 13;
const TOP = 8;
const GRID_W = FRETS * CELL_W;
const GRID_H = (STRINGS - 1) * ROW_H;
const INK = "#111";

const rowY = (stringIdx) => TOP + (STRINGS - 1 - stringIdx) * ROW_H;
const fretX = (fret) => NUT_X + (fret - 0.5) * CELL_W;

export default function ChordDiagram({ name, className }) {
  const data = name ? getChordDiagram(name) : null;
  const chord = data?.chord;
  const { frets = [], fingers = [], barres = [], baseFret = 1 } = chord || {};

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${NUT_X + GRID_W + 6} ${TOP + GRID_H + 20}`}
        width="100%"
        role="img"
        aria-label={name ? `${name} chord diagram` : undefined}
      >
        {!chord ? null : (
        <>
        {Array.from({ length: STRINGS }, (_, r) => (
          <line key={`s${r}`} x1={NUT_X} x2={NUT_X + GRID_W} y1={TOP + r * ROW_H} y2={TOP + r * ROW_H} stroke={INK} strokeWidth="1" />
        ))}
        {Array.from({ length: FRETS }, (_, k) => (
          <line key={`f${k}`} x1={NUT_X + (k + 1) * CELL_W} x2={NUT_X + (k + 1) * CELL_W} y1={TOP} y2={TOP + GRID_H} stroke={INK} strokeWidth="1" />
        ))}
        <line x1={NUT_X} x2={NUT_X} y1={TOP - 0.5} y2={TOP + GRID_H + 0.5} stroke={INK} strokeWidth="3.5" />

        {frets.map((f, i) =>
          f === 0 ? (
            <circle key={`o${i}`} cx={NUT_X - 9} cy={rowY(i)} r="3" fill="none" stroke={INK} strokeWidth="1.1" />
          ) : f === -1 ? (
            <path
              key={`x${i}`}
              d={`M${NUT_X - 12} ${rowY(i) - 3}l6 6m0 -6l-6 6`}
              stroke={INK}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          ) : null
        )}

        {barres.map((b) => {
          const idxs = frets.map((f, i) => (f === b ? i : -1)).filter((i) => i >= 0);
          if (idxs.length < 2) return null;
          const yTop = rowY(Math.max(...idxs));
          const yBottom = rowY(Math.min(...idxs));
          return (
            <rect key={`b${b}`} x={fretX(b) - 4} y={yTop - 4} width="8" height={yBottom - yTop + 8} rx="4" fill={INK} />
          );
        })}

        {frets.map((f, i) =>
          f > 0 ? (
            <g key={`d${i}`}>
              <circle cx={fretX(f)} cy={rowY(i)} r="5.5" fill={INK} />
              {fingers[i] > 0 && (
                <text x={fretX(f)} y={rowY(i)} fill="#fff" fontSize="7.5" fontWeight="700" textAnchor="middle" dominantBaseline="central">
                  {fingers[i]}
                </text>
              )}
            </g>
          ) : null
        )}

        {baseFret > 1 &&
          Array.from({ length: FRETS }, (_, k) => (
            <text key={`fn${k}`} x={fretX(k + 1)} y={TOP + GRID_H + 15} fill="#555" fontSize="7.5" textAnchor="middle">
              {baseFret + k}
            </text>
          ))}
        </>
        )}
      </svg>
    </div>
  );
}
