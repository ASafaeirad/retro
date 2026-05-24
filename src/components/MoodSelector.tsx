import { RadioGroup, RadioGroupItem } from "#components/ui/radio-group.tsx";
import { allMoods, type Mood, moodEmojis } from "#models/mood.model.ts";

interface MoodSelectorProps {
  value?: Mood;
  onChange?: (mood: Mood) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium">Previous sprint mood</p>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex w-full"
      >
        {allMoods.map((option) => (
          <div key={option} className="flex items-center flex-1 gap-2">
            <RadioGroupItem value={option} id={option}>
              {moodEmojis[option]}
            </RadioGroupItem>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
