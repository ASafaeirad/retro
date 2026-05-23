import { cn } from '#lib/cn'

interface Participant {
  _id: string
  name: string
  isReady: boolean
}

interface ParticipantListProps {
  participants: Participant[]
  scrumMaster: string
  currentPresenter?: string
  onSelectPresenter?: (name: string) => void
  className?: string
}

export function ParticipantList({
  participants,
  scrumMaster,
  currentPresenter,
  onSelectPresenter,
  className,
}: ParticipantListProps) {
  return (
    <div className={cn('rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4', className)}>
      <h3 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">
        Participants ({participants.length})
      </h3>

      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant._id}
            onClick={() => onSelectPresenter?.(participant.name)}
            className={cn(
              'flex items-center justify-between rounded-md border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 transition-colors',
              onSelectPresenter && 'cursor-pointer hover:bg-[var(--link-bg-hover)]',
              currentPresenter === participant.name && 'ring-2 ring-[var(--lagoon)] border-[var(--lagoon)]'
            )}
          >
            <div className="flex items-center gap-2">
              {/* Ready status indicator */}
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  participant.isReady ? 'bg-[var(--lagoon)]' : 'bg-[var(--line)]'
                )}
              />

              <span className="text-sm text-[var(--sea-ink)]">
                {participant.name}
                {participant.name === scrumMaster && (
                  <span className="ml-2 text-xs text-[var(--kicker)] font-medium">(SM)</span>
                )}
              </span>
            </div>

            {participant.isReady && (
              <span className="text-xs text-[var(--lagoon)] font-medium">Ready</span>
            )}
          </div>
        ))}
      </div>

      {participants.length > 0 && (
        <div className="mt-4 text-xs text-[var(--sea-ink-soft)]">
          {participants.filter((p) => p.isReady).length} / {participants.length} ready
        </div>
      )}
    </div>
  )
}
