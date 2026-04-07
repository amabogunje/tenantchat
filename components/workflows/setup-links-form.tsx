"use client";

import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { saveSetupLinksAction } from "@/components/forms/tenant-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SetupLinksForm({ existingLinks }: { existingLinks: string[] }) {
  const [links, setLinks] = useState<string[]>(existingLinks.length ? existingLinks : [""]);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Step 1 of 3</div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Add the links you already use</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          Start with any pages that already describe your restaurant. Your website is great, but Instagram, Facebook, and other public pages help too.
        </p>
      </div>

      <Card className="rounded-[1.75rem]">
        <CardHeader>
          <CardTitle>Business links</CardTitle>
          <CardDescription>Add as many as you want. We&apos;ll use them to build your first draft.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveSetupLinksAction} className="space-y-4">
            <div className="space-y-3">
              {links.map((link, index) => (
                <Input
                  key={index}
                  name="links"
                  placeholder={index === 0 ? "https://yourrestaurant.com" : "https://instagram.com/yourrestaurant"}
                  defaultValue={link}
                  className="h-12 rounded-2xl"
                />
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setLinks((current) => [...current, ""])}>
                <Plus className="size-4" />
                Add another link
              </Button>
              <Button type="submit" size="lg">
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}