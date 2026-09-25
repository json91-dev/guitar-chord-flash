import { useEffect, useRef, useState } from "react";
import { CHART_VIEWS } from "./data/chordChart.js";
import ChordDiagram from "./ChordDiagram.jsx";
import ChordChart from "./ChordChart.jsx";

const BEATS_PER_CHORD = 4;
const DEFAULT_BPM = 100;
const BPM_MIN = 30;
const BPM_MAX = 250;
const BPM_STEP = 10;
const BPM_PRESETS = [40, 60, 80, 100, 120, 140];
const BPM_OPTIONS = Array.from(
  { length: (BPM_MAX - BPM_MIN) / BPM_STEP + 1 },
  (_, i) => BPM_MIN + i * BPM_STEP
);

function getActiveChords(chartView) {
  return CHART_VIEWS[chartView].chords;
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
  const [chartView, setChartViewState] = useState("basic");
  const [running, setRunning] = useState(false);
  const [bpm, setBpmState] = useState(DEFAULT_BPM);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [display, setDisplay] = useState({ prev: null, current: null, next: null });
  const [countText, setCountText] = useState("시작 버튼을 눌러 시작하세요");

  const chordHistoryRef = useRef([]);
  const historyIdxRef = useRef(-1);
  const shuffleQueueRef = useRef([]);
  const beatIntervalRef = useRef(Math.round(60000 / DEFAULT_BPM));
  const beatIndexRef = useRef(0);
  const barAnchorRef = useRef(0);
  const beatElapsedRef = useRef(0);
  const timerRef = useRef(null);
  const slidingRef = useRef(false);
  const slideTimeoutRef = useRef(null);
  const audioCtxRef = useRef(null);
  const chartViewRef = useRef(chartView);
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

  function playClick(accent) {
    if (!metronomeOnRef.current) return;
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = accent ? 1800 : 1200;
    gain.gain.setValueAtTime(accent ? 0.42 : 0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  }

  function toggleMetronome() {
    metronomeOnRef.current = !metronomeOnRef.current;
    setMetronomeOn(metronomeOnRef.current);
  }

  function fillQueue() {
    shuffleQueueRef.current = shuffled(getActiveChords(chartViewRef.current));
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

  function scheduleNextBeat() {
    clearTimeout(timerRef.current);
    const targetBeat = beatIndexRef.current + 1;
    const targetTime = barAnchorRef.current + targetBeat * beatIntervalRef.current;
    timerRef.current = setTimeout(() => onBeatTick(targetTime), Math.max(0, targetTime - Date.now()));
  }

  function onBeatTick(targetTime) {
    const isDownbeat = beatIndexRef.current + 1 >= BEATS_PER_CHORD;
    playClick(isDownbeat);
    if (isDownbeat) {
      barAnchorRef.current = targetTime;
      beatIndexRef.current = 0;
      scheduleNextBeat();
      ensureNextPreview();
      slide(-1, () => {
        historyIdxRef.current++;
        ensureNextPreview();
        animateBar(100, BEATS_PER_CHORD * beatIntervalRef.current);
      });
    } else {
      beatIndexRef.current += 1;
      scheduleNextBeat();
    }
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
        beatIndexRef.current = 0;
        barAnchorRef.current = Date.now();
        playClick(true);
        animateBar(100, BEATS_PER_CHORD * beatIntervalRef.current);
        scheduleNextBeat();
      } else {
        barAnchorRef.current =
          Date.now() - (beatIndexRef.current * beatIntervalRef.current + beatElapsedRef.current);
        const barDuration = BEATS_PER_CHORD * beatIntervalRef.current;
        const remainingBar =
          barDuration - (beatIndexRef.current * beatIntervalRef.current + beatElapsedRef.current);
        animateBar((remainingBar / barDuration) * 100, remainingBar);
        scheduleNextBeat();
      }
    } else {
      runningRef.current = false;
      setRunning(false);
      clearTimeout(timerRef.current);
      beatElapsedRef.current = Math.max(
        0,
        Date.now() - (barAnchorRef.current + beatIndexRef.current * beatIntervalRef.current)
      );
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
      beatIndexRef.current = 0;
      beatElapsedRef.current = 0;
      if (runningRef.current) {
        barAnchorRef.current = Date.now();
        animateBar(100, BEATS_PER_CHORD * beatIntervalRef.current);
        scheduleNextBeat();
      }
    });
  }

  function goBack() {
    if (slidingRef.current || historyIdxRef.current <= 0) return;
    clearTimeout(timerRef.current);
    slide(1, () => {
      historyIdxRef.current--;
      beatIndexRef.current = 0;
      beatElapsedRef.current = 0;
      if (runningRef.current) {
        barAnchorRef.current = Date.now();
        animateBar(100, BEATS_PER_CHORD * beatIntervalRef.current);
        scheduleNextBeat();
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
    beatIndexRef.current = 0;
    beatElapsedRef.current = 0;
    updateDisplay();
  }

  function setChartView(v) {
    if (chartViewRef.current === v) return;
    chartViewRef.current = v;
    setChartViewState(v);
    resetChordPool();
  }

  function applyBpm(newBpm) {
    const oldBeatInterval = beatIntervalRef.current;
    const newBeatInterval = Math.round(60000 / newBpm);

    if (runningRef.current) {
      const elapsedInBeat = Date.now() - (barAnchorRef.current + beatIndexRef.current * oldBeatInterval);
      const fraction = Math.min(Math.max(elapsedInBeat / oldBeatInterval, 0), 1);
      beatIntervalRef.current = newBeatInterval;
      setBpmState(newBpm);
      barAnchorRef.current = Date.now() - (beatIndexRef.current + fraction) * newBeatInterval;
      clearTimeout(timerRef.current);
      scheduleNextBeat();
      const barDuration = BEATS_PER_CHORD * newBeatInterval;
      const remainingBar = barDuration - (beatIndexRef.current + fraction) * newBeatInterval;
      animateBar((remainingBar / barDuration) * 100, remainingBar);
    } else {
      if (historyIdxRef.current >= 0) {
        beatElapsedRef.current = Math.round((beatElapsedRef.current / oldBeatInterval) * newBeatInterval) || 0;
      }
      beatIntervalRef.current = newBeatInterval;
      setBpmState(newBpm);
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
                <svg className="chord-card-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4l3 2" />
                </svg>
                <div className="chord-card-empty-text">
                  시작 버튼을 눌러<br />코드 연습을 시작하세요
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

      <div className="chord-pool-picker">
        <select
          className="chord-pool-select"
          value={chartView}
          onChange={(e) => setChartView(e.target.value)}
        >
          {Object.entries(CHART_VIEWS).map(([key, view]) => (
            <option key={key} value={key}>{view.label}</option>
          ))}
        </select>
        <svg className="chord-pool-picker-icon" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="1,1 5,5 9,1" />
        </svg>
      </div>

      <div className="speed-control">
        <div className="speed-bpm">
          <span id="bpm-value">{bpm}</span> BPM
          <button className={`metro-btn${metronomeOn ? " active" : ""}`} id="metro-btn" onClick={toggleMetronome}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 17a7 7 0 0114 0" />
              <path d="M4 21h16" />
              <circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none" />
            </svg>
            메트로놈
          </button>
        </div>
        <div className="bpm-presets">
          {BPM_PRESETS.map((p) => (
            <button
              key={p}
              className={`bpm-preset${bpm === p ? " active" : ""}`}
              onClick={() => applyBpm(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="chord-pool-picker">
          <select
            className="chord-pool-select"
            value={bpm}
            onChange={(e) => applyBpm(parseInt(e.target.value, 10))}
          >
            {BPM_OPTIONS.map((v) => (
              <option key={v} value={v}>{v} BPM</option>
            ))}
          </select>
          <svg className="chord-pool-picker-icon" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="1,1 5,5 9,1" />
          </svg>
        </div>
      </div>

      <div className="controls">
        <button className="btn-pill" onClick={goBack}>
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="5,1 1,5.5 5,10" /></svg>
          이전
        </button>
        <button className="btn-pill btn-pill-main" onClick={startStop} id="start-btn">
          {running ? (
            <svg className="btn-pill-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="btn-pill-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
          )}
          {running ? "일시정지" : "시작"}
        </button>
        <button className="btn-pill" onClick={nextChord}>
          다음
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1,1 5,5.5 1,10" /></svg>
        </button>
      </div>
      </>
      )}
    </>
  );
}
