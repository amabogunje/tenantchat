import { ConfidenceBadge } from "@/components/feedback/confidence-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExtractionReviewItem } from "@/verticals/restaurant";

export function ReviewQueue({ items }: { items: ExtractionReviewItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs your review</CardTitle>
        <CardDescription>We highlight uncertain or business-critical details so you only review what matters.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm font-medium">{item.fieldName}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.proposedValue}</div>
                <div className="mt-2 text-xs text-muted-foreground">Source: {item.sourceRef} | Why: {item.reason}</div>
              </div>
              <ConfidenceBadge confidence={item.confidence} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
