import { useState } from "react";
import ChordDiagram from "./ChordDiagram.jsx";
import { CHART_VIEWS } from "./data/chordChart.js";

export default function ChordChart() {
  const [chartView, setChartView] = useState("basic");
  const { label, columns, lines, total } = CHART_VIEWS[chartView];
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
          <div className="chord-sheet-meta">
            {label} · 총 {total}코드
          </div>
        </div>

        <p className="chord-sheet-legend">
          <span>○ <b>개방현</b>(그냥 침)</span>
          <span>× <b>치지 않는 줄</b></span>
          <span><b>숫자</b> = 운지 손가락 (1검지 2중지 3약지 4소지)</span>
          <span><b>왼쪽 굵은 선</b> = 너트(0프렛)</span>
          <span><b>3fr</b> = 3프렛부터 시작</span>
        </p>

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
