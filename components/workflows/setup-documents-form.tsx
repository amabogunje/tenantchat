"use client";

import { ArrowLeft, ArrowRight, FileText, Upload } from "lucide-react";
import { uploadSetupDocumentsAction } from "@/components/forms/tenant-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupDocumentsForm({
  uploadedFiles,
}: {
  uploadedFiles: Array<{ id: string; filename: string; status: string; summary: string }>;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Step 2 of 3</div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Upload the documents you already have</h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          Menus, brochures, flyers, PDFs, Word documents, images, and notes all help. You don&apos;t need to organize them perfectly first.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Choose one or more files. We&apos;ll fold them into your draft and highlight anything that needs review.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={uploadSetupDocumentsAction} className="space-y-5">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center transition-colors hover:border-primary/40 hover:bg-muted/50">
                <Upload className="size-6 text-primary" />
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Drop files here or click to browse</div>
                  <div className="text-sm text-muted-foreground">PDF, DOC, DOCX, JPG, PNG, TXT, and more</div>
                </div>
                <input type="file" name="files" multiple className="hidden" />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button asChild type="button" variant="outline">
                  <a href="/app/restaurant/onboarding">
                    <ArrowLeft className="size-4" />
                    Back
                  </a>
                </Button>
                <Button type="submit" size="lg">
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle>Already added</CardTitle>
            <CardDescription>Your uploaded files will appear here as we bring them into the draft.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadedFiles.length ? (
              uploadedFiles.map((file) => (
                <div key={file.id} className="rounded-2xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-muted p-2">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{file.filename}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{file.summary}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">No documents uploaded yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}