import { useState } from "react";
import { Input } from "#components/ui/input.tsx";
import { Label } from "#components/ui/label.tsx";
import { Button } from "#ui/button.tsx";

export const CreateSessionModal = ({
  onClose,
  onCreate,
}: {
  onClose?: () => void;
  onCreate?: ({
    sprintNumber,
    creatorName,
  }: {
    sprintNumber: string;
    creatorName: string;
  }) => void;
}) => {
  const [sprintNumber, setSprintNumber] = useState("");
  const [creatorName, setCreatorName] = useState("");

  return (
    <form
      onSubmit={() => onCreate?.({ sprintNumber, creatorName })}
      className="space-y-4 mb-8"
    >
      <div>
        <Label htmlFor="sprintNumber">Sprint Number</Label>
        <Input
          id="sprintNumber"
          type="number"
          value={sprintNumber}
          onChange={(e) => setSprintNumber(e.target.value)}
          placeholder="e.g., 42"
          required
          autoFocus
        />
      </div>

      <div>
        <Label htmlFor="creatorName">
          Your Name (you'll be the Scrum Master)
        </Label>
        <Input
          id="creatorName"
          type="text"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Create Session
        </Button>
        <Button
          onClick={() => {
            setSprintNumber("");
            setCreatorName("");
            onClose?.();
          }}
          variant="neutral"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
