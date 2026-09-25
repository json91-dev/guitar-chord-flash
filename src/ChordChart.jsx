import { useState } from "react";
import ChordDiagram from "./ChordDiagram.jsx";
import { CHART_VIEWS } from "./data/chordChart.js";

export default function ChordChart() {
  const [chartView, setChartView] = useState("basic");
  const { columns, lines } = CHART_VIEWS[chartView];
  const gridStyle = { "--cols": columns.length };

  return (
    <div className="chord-chart">
      <div className="mode-control">
        {Object.entries(CHART_VIEWS).map(([key, view]) => (
          <button
            key={key}
            className={`mode-btn${chartView === key ? " active" : ""}`}
            onClick={() => setChartView(key)}
          >
            {view.label}
          </button>
        ))}
      </div>

      <div className="chord-sheet">
        <div className="chord-sheet-header">
          <h1 className="chord-sheet-title">기타 코드표</h1>
        </div>

        <div className="chart-scroll">
          <div className="chart-table" style={gridStyle}>
            <div className="chart-head-blank" />
            {columns.map((c) => (
              <div key={c.key} className="chart-head">{c.title}</div>
            ))}
            {lines.map((line) => (
              <div key={line.pitchClass} className="chart-row">
                <div className="chart-root">{line.label}</div>
                {line.cells.map((cell, i) => (
                  <div key={columns[i].key} className="chart-cell">
                    {cell && (
                      <>
                        <div className="chart-item-name">{cell[0]}</div>
                        <ChordDiagram name={cell[0]} className="chart-diagram" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
