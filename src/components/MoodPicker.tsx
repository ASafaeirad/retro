import { RadioGroup, RadioGroupItem } from "#components/ui/radio-group.tsx";
import { allMoods, type Mood, moodEmojis } from "#models/mood.model.tsx";
import { Label } from "./ui/label";

interface MoodSelectorProps {
  value?: Mood;
  onChange?: (mood: Mood) => void;
}

export function MoodPicker({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label>Previous sprint mood</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex w-full justify-between"
      >
        {allMoods
          .filter((mood) => mood !== "Unknown")
          .map((option) => {
            const EmojiComponent = moodEmojis[option];
            return (
              <div key={option} className="flex items-center gap-2">
                <RadioGroupItem
                  className="justify-center items-center"
                  value={option}
                  id={option}
                >
                  <EmojiComponent className="size-9 pixelated cursor-pointer" />
                </RadioGroupItem>
              </div>
            );
          })}
      </RadioGroup>
    </div>
  );
}
