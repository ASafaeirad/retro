import { useMutation } from "convex/react";
import {
  Card,
  CardBlock,
  CardContent,
  CardHeader,
} from "#components/ui/card.tsx";
import { RadioGroup, RadioGroupItem } from "#components/ui/radio-group.tsx";
import { api } from "#convex/api";
import type { Session } from "#models/session.ts";

const voteCounts = [1, 2, 3, 4, 5];

export const VoteControl = ({ session }: { session: Session }) => {
  const setVoteLimit = useMutation(api.retro.setVoteLimit);
  const submit = (v: string) => {
    setVoteLimit({ sessionId: session._id, voteLimit: Number(v) });
  };

  return (
    <Card space="compact">
      <CardHeader>
        <h3>Vote on Tickets</h3>
      </CardHeader>
      <CardContent>
        <CardBlock>
          <p className="text-sm">Waiting for scrum master to set vote count</p>
        </CardBlock>
        <RadioGroup
          onValueChange={submit}
          className="flex w-full justify-between"
        >
          {voteCounts.map((option) => {
            return (
              <RadioGroupItem
                key={option}
                size="sm"
                value={option.toString()}
                id={option.toString()}
              >
                {option}
              </RadioGroupItem>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
