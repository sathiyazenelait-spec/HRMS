import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
};

export function ModulePlaceholder({ title, description, icon: Icon, features }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} icon={Icon} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planned capabilities</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-3 rounded-md border bg-card p-3 text-sm">
              <Badge variant="secondary" className="mt-0.5">Soon</Badge>
              <span className="text-foreground/90">{f}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        This module is scaffolded in the shell. Ask to build it out next and it will be wired up with real data and workflows.
      </p>
    </div>
  );
}