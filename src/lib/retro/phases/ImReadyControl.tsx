import { Button } from "#components/ui/button.tsx";
import {
  Card,
  CardBlock,
  CardContent,
  CardHeader,
} from "#components/ui/card.tsx";

interface Props {
  onToggleReady?: () => void;
  isReady: boolean;
}

export const ImReadyControl = ({ onToggleReady, isReady }: Props) => {
  return (
    <Card space="compact">
      <CardHeader>
        <h3>Ready?</h3>
      </CardHeader>
      <CardContent>
        <CardBlock>
          <p className="text-sm">
            Add tickets to the board. Mark yourself as ready when done.
          </p>
        </CardBlock>
        <Button
          size="sm"
          onClick={onToggleReady}
          shadow={isReady ? "reverse" : "default"}
        >
          {isReady ? "✓ Ready" : "Mark as Ready"}
        </Button>
      </CardContent>
    </Card>
  );
};
