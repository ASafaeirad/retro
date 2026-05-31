import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#components/ui/dialog.tsx";
import { Input } from "#components/ui/input.tsx";
import { Label } from "#components/ui/label.tsx";
import { Button } from "#ui/button.tsx";

type Props = {
  onClose?: () => void;
  onCreate?: (p: { sprintNumber: string; creatorName: string }) => void;
};

export const CreateSessionModal = ({ onClose, onCreate }: Props) => {
  const [sprintNumber, setSprintNumber] = useState("");
  const [creatorName, setCreatorName] = useState("");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Session</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate?.({ sprintNumber, creatorName });
          }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
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
      </DialogContent>
    </Dialog>
  );
};
