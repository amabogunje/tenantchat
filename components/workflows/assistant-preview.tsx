import { ConfidenceBadge } from "@/components/feedback/confidence-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssistantPreviewAnswer } from "@/verticals/restaurant/mock-data";

export function AssistantPreview({
  answers,
  title = "Assistant Preview",
  description = "See how your assistant may respond before customers do.",
}: {
  answers: AssistantPreviewAnswer[];
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {answers.map((answer) => (
          <div key={answer.id} className="rounded-[1.5rem] border bg-muted/50 p-4">
            <div className="flex justify-end">
              <div className="max-w-xl rounded-[1.25rem] bg-foreground px-4 py-3 text-sm text-background">{answer.prompt}</div>
            </div>
            <div className="mt-3 flex justify-start">
              <div className="max-w-2xl rounded-[1.25rem] bg-card px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{answer.intent.replace(/_/g, " ")}</Badge>
                  <ConfidenceBadge confidence={answer.confidence} />
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground">{answer.response}</p>
                <div className="mt-3 text-xs text-muted-foreground">Sources: {answer.sourceRefs.join(", ")}</div>
                {answer.actions.length ? <div className="mt-2 text-xs text-muted-foreground">Suggested actions: {answer.actions.join(", ")}</div> : null}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
