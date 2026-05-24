import { useState } from "react";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import { Input } from "./ui/input";

interface EditTicketFormProps {
  initialText: string;
  initialImageUrl?: string;
  category: "well" | "improve";
  onSubmit: (text: string, imageUrl?: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function EditTicketForm({
  initialText,
  initialImageUrl,
  category,
  onSubmit,
  onCancel,
  isSubmitting,
  className,
}: EditTicketFormProps) {
  const [text, setText] = useState(initialText);
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim(), imageUrl.trim() || undefined);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-lg border-2 bg-[var(--surface)] p-4",
        category === "well" && "border-[var(--lagoon-deep)]",
        category === "improve" && "border-[var(--palm)]",
        className,
      )}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`What ${category === "well" ? "went well" : "could be improved"}?`}
        className="mb-2 w-full resize-none rounded-md border border-[var(--line)] bg-white dark:bg-[var(--foam)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:outline-none focus:ring-1 focus:ring-[var(--lagoon)]"
        rows={3}
        autoFocus
        disabled={isSubmitting}
      />

      <Input
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Image URL (optional)"
        disabled={isSubmitting}
      />

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>

        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          variant="neutral"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
