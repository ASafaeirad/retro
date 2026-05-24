import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider as BaseConvexProvider } from "convex/react";
import { config } from "#lib/config";

const convexQueryClient = new ConvexQueryClient(config.convexUrl);

export function ConvexProvider({ children }: React.PropsWithChildren) {
  return (
    <BaseConvexProvider client={convexQueryClient.convexClient}>
      {children}
    </BaseConvexProvider>
  );
}
