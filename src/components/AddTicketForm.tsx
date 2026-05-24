import { useState } from "react";
import { cn } from "#lib/cn";
import { Button } from "#ui/button.tsx";
import { Input } from "./ui/input";

interface AddTicketFormProps {
  category: "well" | "improve";
  onSubmit: (text: string, imageUrl?: string) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function AddTicketForm({
  category,
  onSubmit,
  onCancel,
  isSubmitting,
  className,
}: AddTicketFormProps) {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim(), imageUrl.trim() || undefined);
      setText("");
      setImageUrl("");
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
          {isSubmitting ? "Adding..." : "Add Ticket"}
        </Button>

        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            variant="neutral"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
