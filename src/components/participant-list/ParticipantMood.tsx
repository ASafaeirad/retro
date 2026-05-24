import { useState } from "react";
import { Avatar, AvatarFallback } from "#components/ui/avatar.tsx";
import { cn } from "#lib/cn";
import {
  allMoods,
  type Mood,
  moodEmojis,
  toMood,
} from "#models/mood.model.tsx";
import { Button } from "#ui/button.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type ParticipantMoodProps = {
  mood: Mood;
  onSelect?: (mood: Mood) => void;
  disabled?: boolean;
};

export const ParticipantMood = ({
  mood,
  onSelect,
  disabled,
}: ParticipantMoodProps) => {
  const Mood = moodEmojis[mood];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        disabled={disabled}
        title={disabled ? "Previous sprint mood" : "Click to change mood"}
      >
        <Avatar className={cn({ "cursor-pointer": !disabled })}>
          <AvatarFallback>
            <Mood />
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-3 grid grid-cols-3 gap-2">
        {allMoods.map((option) => {
          const Mood = moodEmojis[toMood(option)];

          return (
            <Button
              key={option}
              variant={option !== mood ? "neutral" : "default"}
              shadow="reverse"
              onClick={() => {
                onSelect?.(option);
                setIsOpen(false);
              }}
              title={option}
            >
              <Mood />
            </Button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};
