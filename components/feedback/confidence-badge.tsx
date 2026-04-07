import { Badge } from "@/components/ui/badge";

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percent = Math.round(confidence * 100);
  const variant = percent >= 85 ? "success" : percent >= 70 ? "warning" : "destructive";
  return <Badge variant={variant}>{percent}% confidence</Badge>;
}
