export type Mood = "Happy" | "Neutral" | "Concerned" | "Unknown";

export const moodEmojis: Record<Mood, string> = {
  Happy: "😊",
  Neutral: "😐",
  Concerned: "😟",
  Unknown: "❓",
};

export const toMood = (moodStr: string | undefined): Mood => {
  return allMoods.find((mood) => mood === moodStr) ?? "Unknown";
};

export const allMoods: Mood[] = ["Happy", "Neutral", "Concerned", "Unknown"];
