interface RetroHeaderProps {
  sprintNumber: number;
}

export function RetroHeader({ sprintNumber }: RetroHeaderProps) {
  return (
    <header className="flex gap-4 items-center">
      <h1 className="text-3xl uppercase">Sprint {sprintNumber} Retro</h1>
      <p className="text-foreground-muted text-sm"></p>
    </header>
  );
}
