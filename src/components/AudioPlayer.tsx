import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, RotateCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const RATES = [0.75, 1, 1.25];

type Props = { src: string; className?: string };

export function AudioPlayer({ src, className }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    setPlaying(false);
    setError(false);
    setCurrent(0);
    setDuration(0);
  }, [src]);

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      el.pause();
      return;
    }
    try {
      setError(false);
      setLoading(true);
      el.playbackRate = rate;
      await el.play();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [playing, rate]);

  const seekBy = (delta: number) => {
    const el = ref.current;
    if (!el) return;
    el.currentTime = Math.min(Math.max(0, el.currentTime + delta), duration || el.duration || 0);
  };

  const retry = () => {
    const el = ref.current;
    if (!el) return;
    setError(false);
    el.load();
    void el.play().catch(() => setError(true));
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/25 bg-card/80 p-3 shadow-sm backdrop-blur",
        className,
      )}
    >
      <audio
        ref={ref}
        src={src}
        preload="none"
        playsInline
        crossOrigin="anonymous"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onPlaying={() => {
          setPlaying(true);
          setLoading(false);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
          setPlaying(false);
        }}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar audio" : "Reproducir audio"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 active:scale-95"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>

        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            aria-label="Progreso del audio"
            onChange={(e) => {
              const el = ref.current;
              const v = Number(e.target.value);
              setCurrent(v);
              if (el) el.currentTime = v;
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-primary/20 accent-primary outline-none"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary, 0 0% 0%)) 0%, transparent 0%)`,
            }}
          />
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-150"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] tabular-nums text-muted-foreground">
            <span>{fmt(current)}</span>
            <span>{loading ? "Cargando…" : fmt(duration)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => seekBy(-10)}
            aria-label="Retroceder 10 segundos"
            className="rounded-lg border border-border p-2 text-muted-foreground transition hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => seekBy(10)}
            aria-label="Adelantar 10 segundos"
            className="rounded-lg border border-border p-2 text-muted-foreground transition hover:text-foreground"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
              setRate(next);
              if (ref.current) ref.current.playbackRate = next;
            }}
            aria-label="Cambiar velocidad"
            className="rounded-lg border border-border px-2 py-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground transition hover:text-foreground"
          >
            {rate}x
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>No se pudo cargar el audio.</span>
          <button type="button" onClick={retry} className="font-semibold underline">
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}

export default AudioPlayer;
