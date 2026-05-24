import { Angry } from "#components/emojis/Angry.tsx";
import { Cry } from "#components/emojis/Cry.tsx";
import { Happy } from "#components/emojis/Happy.tsx";
import { Laugh } from "#components/emojis/Laugh.tsx";
import { Neutral } from "#components/emojis/Neutral.tsx";
import { Sad } from "#components/emojis/Sad.tsx";

export type Mood =
  | "Cry"
  | "Sad"
  | "Laugh"
  | "Happy"
  | "Neutral"
  | "Angry"
  | "Unknown";

export const moodEmojis: Record<
  Mood,
  React.FunctionComponent<React.SVGProps<SVGSVGElement>>
> = {
  Cry: Cry,
  Sad: Sad,
  Laugh: Laugh,
  Happy: Happy,
  Neutral: Neutral,
  Angry: Angry,
  Unknown: () => null,
};

export const toMood = (moodStr: string | undefined): Mood => {
  return allMoods.find((mood) => mood === moodStr) ?? "Unknown";
};

export const allMoods: Mood[] = [
  "Angry",
  "Cry",
  "Sad",
  "Happy",
  "Laugh",
  "Neutral",
];
