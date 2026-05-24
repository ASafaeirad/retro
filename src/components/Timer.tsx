import { useEffect, useState } from "react";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";

interface TimerProps {
  startedAt: number;
  duration: number; // milliseconds
  isPaused: boolean;
  pausedAt?: number;
  onPause: () => void;
  onResume: () => void;
  onExtend: (additionalTime: number) => void;
  onComplete: () => void;
  className?: string;
}

export function Timer({
  startedAt,
  duration,
  isPaused,
  pausedAt,
  onPause,
  onResume,
  onExtend,
  onComplete,
  className,
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (isPaused && pausedAt) {
        const elapsed = pausedAt - startedAt;
        return Math.max(0, duration - elapsed);
      }
      const elapsed = Date.now() - startedAt;
      return Math.max(0, duration - elapsed);
    };

    setTimeRemaining(calculateTimeRemaining());

    if (!isPaused) {
      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining();
        setTimeRemaining(remaining);

        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [startedAt, duration, isPaused, pausedAt]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const percentage = (timeRemaining / duration) * 100;
  const isWarning = percentage <= 25 && percentage > 0;

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-4",
        isWarning
          ? "border-[var(--destructive)] bg-red-50 dark:bg-red-950/20"
          : "border-[var(--line)] bg-[var(--surface)]",
        className,
      )}
    >
      <div className="mb-3 text-center">
        <div
          className={cn(
            "text-4xl font-bold tabular-nums",
            isWarning ? "text-[var(--destructive)]" : "text-[var(--sea-ink)]",
          )}
        >
          {formatTime(timeRemaining)}
        </div>
        <div className="mt-1 text-xs text-[var(--sea-ink-soft)]">
          {isPaused
            ? "Paused"
            : timeRemaining === 0
              ? "Time's up!"
              : "Remaining"}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className={cn(
            "h-full transition-all duration-300",
            isWarning ? "bg-[var(--destructive)]" : "bg-[var(--lagoon)]",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {isPaused ? (
          <Button onClick={onResume} size="sm" className="flex-1">
            Resume
          </Button>
        ) : (
          <Button
            onClick={onPause}
            variant="neutral"
            size="sm"
            className="flex-1"
          >
            Pause
          </Button>
        )}

        <Button
          onClick={() => onExtend(60000)} // Add 1 minute
          variant="neutral"
          size="sm"
        >
          +1 min
        </Button>

        <Button onClick={onComplete} variant="reverse" size="sm">
          Done
        </Button>
      </div>
    </div>
  );
}
