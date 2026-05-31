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

type Props = {
  session: Session;
  disabled?: boolean;
};

export const VoteControl = ({ session, disabled }: Props) => {
  const setVoteLimit = useMutation(api.retro.setVoteLimit);
  const value = session.voteLimit;
  const submit = (v: string) => {
    if (disabled) return;
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
          disabled={disabled}
          value={value?.toString()}
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
