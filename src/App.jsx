import { useEffect, useRef, useState } from "react";
import { lowChords, highChords } from "./data/chords.js";
import ChordDiagram from "./ChordDiagram.jsx";
import ChordChart from "./ChordChart.jsx";

const BPM_PRESETS = [10, 20, 30, 40, 50, 60];
const DEFAULT_BPM = 6;
const DEFAULT_FILTERS = { showAccidental: false, showDim: false, showSus: false };

const isAccidental = (name) => /[#b]/.test(name);
const isDim = (name) => /dim$/.test(name);
const isSus = (name) => /sus4$/.test(name);

function getActiveChords(mode, filters) {
  const pool = mode === "high" ? highChords : lowChords;
  return pool.filter(([name]) => {
    if (!filters.showAccidental && isAccidental(name)) return false;
    if (!filters.showDim && isDim(name)) return false;
    if (!filters.showSus && isSus(name)) return false;
    return true;
  });
}

function shuffled(pool) {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [page, setPage] = useState("flashcard");
  const [mode, setModeState] = useState("low");
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);
  const [running, setRunning] = useState(false);
  const [bpm, setBpmState] = useState(DEFAULT_BPM);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [display, setDisplay] = useState({ prev: null, current: null, next: null });
  const [countText, setCountText] = useState("시작 버튼을 눌러 시작하세요");

  const chordHistoryRef = useRef([]);
  const historyIdxRef = useRef(-1);
  const shuffleQueueRef = useRef([]);
  const intervalRef = useRef(Math.round(60000 / DEFAULT_BPM));
  const timerRef = useRef(null);
  const periodStartRef = useRef(0);
  const elapsedRef = useRef(0);
  const slidingRef = useRef(false);
  const slideTimeoutRef = useRef(null);
  const audioCtxRef = useRef(null);
  const modeRef = useRef(mode);
  const filtersRef = useRef(filters);
  const pageRef = useRef(page);
  const runningRef = useRef(false);
  const metronomeOnRef = useRef(false);

  const stageRef = useRef(null);
  const timerBarRef = useRef(null);
  const cardCurrentRef = useRef(null);

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }

  function playClick() {
    if (!metronomeOnRef.current) return;
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  }

  function toggleMetronome() {
    metronomeOnRef.current = !metronomeOnRef.current;
    setMetronomeOn(metronomeOnRef.current);
  }

  function fillQueue() {
    shuffleQueueRef.current = shuffled(getActiveChords(modeRef.current, filtersRef.current));
  }

  function getNextFromQueue() {
    if (shuffleQueueRef.current.length === 0) fillQueue();
    return shuffleQueueRef.current.pop();
  }

  function ensureNextPreview() {
    while (chordHistoryRef.current.length <= historyIdxRef.current + 1) {
      chordHistoryRef.current.push(getNextFromQueue());
    }
  }

  function updateDisplay() {
    const history = chordHistoryRef.current;
    const idx = historyIdxRef.current;
    setDisplay({
      prev: idx > 0 ? history[idx - 1] : null,
      current: idx >= 0 ? history[idx] : null,
      next: history[idx + 1] || null,
    });
    setCountText(idx >= 0 ? `${idx + 1}번째 코드` : "시작 버튼을 눌러 시작하세요");
  }

  function animateBar(fromPct, durationMs) {
    const b = timerBarRef.current;
    if (!b) return;
    b.style.transition = "none";
    b.style.width = fromPct + "%";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        b.style.transition = `width ${durationMs / 1000}s linear`;
        b.style.width = "0%";
      })
    );
  }

  function freezeBar() {
    const b = timerBarRef.current;
    if (!b) return;
    const pct = (parseFloat(getComputedStyle(b).width) / b.parentElement.offsetWidth) * 100;
    b.style.transition = "none";
    b.style.width = pct + "%";
  }

  function slide(direction, onMidpoint) {
    if (slidingRef.current) return;
    slidingRef.current = true;
    const cardW = cardCurrentRef.current.offsetWidth;
    const stage = stageRef.current;
    stage.style.transform = `translateX(${direction * cardW}px)`;
    slideTimeoutRef.current = setTimeout(() => {
      if (onMidpoint) onMidpoint();
      updateDisplay();
      stage.style.transition = "none";
      stage.style.transform = "translateX(0)";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          stage.style.transition = "transform 0.35s cubic-bezier(0.4,0,0.2,1)";
          slidingRef.current = false;
        })
      );
    }, 350);
  }

  function scheduleAutoAdvance(remaining) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(function autoTick() {
      ensureNextPreview();
      slide(-1, () => {
        historyIdxRef.current++;
        ensureNextPreview();
        elapsedRef.current = 0;
        periodStartRef.current = Date.now();
        playClick();
        animateBar(100, intervalRef.current);
        timerRef.current = setTimeout(autoTick, intervalRef.current);
      });
    }, remaining);
  }

  function startStop() {
    if (!runningRef.current) {
      runningRef.current = true;
      setRunning(true);
      if (historyIdxRef.current === -1) {
        chordHistoryRef.current.push(getNextFromQueue());
        historyIdxRef.current = 0;
        ensureNextPreview();
        updateDisplay();
        elapsedRef.current = 0;
        periodStartRef.current = Date.now();
        playClick();
        animateBar(100, intervalRef.current);
        scheduleAutoAdvance(intervalRef.current);
      } else {
        const remaining = intervalRef.current - elapsedRef.current;
        periodStartRef.current = Date.now();
        animateBar((remaining / intervalRef.current) * 100, remaining);
        scheduleAutoAdvance(remaining);
      }
    } else {
      runningRef.current = false;
      setRunning(false);
      clearTimeout(timerRef.current);
      elapsedRef.current += Date.now() - periodStartRef.current;
      freezeBar();
    }
  }

  function nextChord() {
    if (slidingRef.current) return;
    clearTimeout(timerRef.current);
    ensureNextPreview();
    slide(-1, () => {
      historyIdxRef.current++;
      ensureNextPreview();
      elapsedRef.current = 0;
      if (runningRef.current) {
        periodStartRef.current = Date.now();
        playClick();
        animateBar(100, intervalRef.current);
        scheduleAutoAdvance(intervalRef.current);
      }
    });
  }

  function goBack() {
    if (slidingRef.current || historyIdxRef.current <= 0) return;
    clearTimeout(timerRef.current);
    slide(1, () => {
      historyIdxRef.current--;
      elapsedRef.current = 0;
      if (runningRef.current) {
        periodStartRef.current = Date.now();
        animateBar(100, intervalRef.current);
        scheduleAutoAdvance(intervalRef.current);
      }
    });
  }

  function resetChordPool() {
    if (runningRef.current) {
      runningRef.current = false;
      setRunning(false);
      clearTimeout(timerRef.current);
      freezeBar();
    }
    clearTimeout(slideTimeoutRef.current);
    slidingRef.current = false;
    if (stageRef.current) {
      stageRef.current.style.transition = "none";
      stageRef.current.style.transform = "translateX(0)";
    }
    shuffleQueueRef.current = [];
    chordHistoryRef.current = [];
    historyIdxRef.current = -1;
    elapsedRef.current = 0;
    updateDisplay();
  }

  function setMode(m) {
    if (modeRef.current === m) return;
    modeRef.current = m;
    setModeState(m);
    resetChordPool();
  }

  function toggleFilter(key) {
    const next = { ...filtersRef.current, [key]: !filtersRef.current[key] };
    filtersRef.current = next;
    setFiltersState(next);
    resetChordPool();
  }

  function applySpeed(newBpm) {
    const oldInterval = intervalRef.current;
    intervalRef.current = Math.round(60000 / newBpm);
    setBpmState(newBpm);

    if (runningRef.current) {
      const totalElapsed = elapsedRef.current + (Date.now() - periodStartRef.current);
      const fraction = Math.min(totalElapsed / oldInterval, 1);
      const newRemaining = intervalRef.current * (1 - fraction);
      clearTimeout(timerRef.current);
      elapsedRef.current = Math.round(fraction * intervalRef.current);
      periodStartRef.current = Date.now();
      animateBar((1 - fraction) * 100, newRemaining);
      scheduleAutoAdvance(newRemaining);
    } else if (historyIdxRef.current >= 0) {
      elapsedRef.current = Math.round((elapsedRef.current / oldInterval) * intervalRef.current);
    }
  }

  function changePage(p) {
    pageRef.current = p;
    setPage(p);
  }

  function handleKeyDown(e) {
    if (pageRef.current !== "flashcard") return;
    if (e.code === "Space") { e.preventDefault(); startStop(); }
    if (e.code === "Enter") { e.preventDefault(); nextChord(); }
    if (e.code === "ArrowLeft") { e.preventDefault(); goBack(); }
    if (e.code === "ArrowRight") { e.preventDefault(); nextChord(); }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.style.transition = "none";
      stageRef.current.style.transform = "translateX(0)";
    }
  }, []);

  return (
    <>
      <div className="page-nav">
        <button className={`page-nav-btn${page === "flashcard" ? " active" : ""}`} onClick={() => changePage("flashcard")}>코드 연습</button>
        <button className={`page-nav-btn${page === "chart" ? " active" : ""}`} onClick={() => changePage("chart")}>코드표</button>
      </div>

      {page === "chart" ? (
        <ChordChart />
      ) : (
      <>
      <div className="stage-wrapper">
        <div className="stage" ref={stageRef} id="stage">
          <div className="chord-card" id="card-prev" style={{ visibility: display.prev ? "visible" : "hidden" }}>
            <div className="chord-name">{display.prev ? display.prev[0] : ""}</div>
            <div className="chord-label">{display.prev ? display.prev[1] : ""}</div>
          </div>
          <div className="chord-card" id="card-current" ref={cardCurrentRef}>
            {display.current ? (
              <>
                <div className="chord-name">{display.current[0]}</div>
                <div className="chord-label">{display.current[1]}</div>
              </>
            ) : (
              <div className="chord-card-empty">
                <div className="chord-card-empty-icon">🎸</div>
                <div className="chord-card-empty-text">
                  ▶ 시작 버튼을 눌러<br />코드 연습을 시작하세요
                </div>
              </div>
            )}
            <ChordDiagram
              name={display.current ? display.current[0] : null}
              className={`chord-diagram${display.current ? "" : " chord-diagram-hidden"}`}
            />
            <div className={`timer-bar-bg${display.current ? "" : " timer-bar-bg-hidden"}`}>
              <div className="timer-bar" id="timer-bar" ref={timerBarRef}></div>
            </div>
          </div>
          <div className="chord-card" id="card-next" style={{ visibility: display.next ? "visible" : "hidden" }}>
            <div className="chord-name">{display.next ? display.next[0] : ""}</div>
            <div className="chord-label">{display.next ? display.next[1] : ""}</div>
          </div>
        </div>
      </div>
      <div className="count" id="count-badge">{countText}</div>

      <div className="mode-control">
        <button className={`mode-btn${mode === "low" ? " active" : ""}`} onClick={() => setMode("low")}>로우코드</button>
        <button className={`mode-btn${mode === "high" ? " active" : ""}`} onClick={() => setMode("high")}>하이코드</button>
      </div>

      <div className="filter-control">
        <label className="filter-checkbox">
          <input type="checkbox" checked={filters.showAccidental} onChange={() => toggleFilter("showAccidental")} />
          #/b 포함
        </label>
        <label className="filter-checkbox">
          <input type="checkbox" checked={filters.showDim} onChange={() => toggleFilter("showDim")} />
          dim 포함
        </label>
        <label className="filter-checkbox">
          <input type="checkbox" checked={filters.showSus} onChange={() => toggleFilter("showSus")} />
          sus4 포함
        </label>
      </div>

      <div className="speed-control">
        <div className="speed-bpm">
          <span id="bpm-value">{bpm}</span> BPM
          <button className={`metro-btn${metronomeOn ? " active" : ""}`} id="metro-btn" onClick={toggleMetronome}>♩ 메트로놈</button>
        </div>
        <div className="speed-slider-row">
          <span className="speed-side">느리게</span>
          <input
            type="range"
            id="speed-slider"
            min="1"
            max="60"
            value={bpm}
            onChange={(e) => applySpeed(parseInt(e.target.value, 10))}
          />
          <span className="speed-side">빠르게</span>
        </div>
        <div className="bpm-presets">
          {BPM_PRESETS.map((p) => (
            <button
              key={p}
              className={`bpm-preset${bpm === p ? " active" : ""}`}
              onClick={() => applySpeed(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="controls">
        <button className="btn-pill" onClick={goBack}>
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="5,1 1,5.5 5,10" /></svg>
          이전
        </button>
        <button className="btn-pill btn-pill-main" onClick={startStop} id="start-btn">
          {running ? "⏸ 일시정지" : "▶ 시작"}
        </button>
        <button className="btn-pill" onClick={nextChord}>
          다음
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,1 5,5.5 1,10" /></svg>
        </button>
      </div>
      </>
      )}
    </>
  );
}
