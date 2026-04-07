import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StatusCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card className="rounded-[1.5rem] border-white/50 bg-card/90">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      {detail ? <CardContent className="pt-0 text-sm text-muted-foreground">{detail}</CardContent> : null}
    </Card>
  );
}
