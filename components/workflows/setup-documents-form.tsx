"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, FileText, Upload } from "lucide-react";
import { uploadSetupDocumentsAction } from "@/components/forms/tenant-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ExistingFile = { id: string; filename: string; status: string; summary: string };

function UploadSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={disabled || pending}>
      {pending ? "Uploading..." : "Next"}
      <ArrowRight className="size-4" />
    </Button>
  );
}

export function SetupDocumentsForm({
  uploadedFiles,
}: {
  uploadedFiles: ExistingFile[];
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const selectedSummary = useMemo(
    () => selectedFiles.map((file) => ({ name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB` })),
    [selectedFiles],
  );

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
            <form action={uploadSetupDocumentsAction} encType="multipart/form-data" className="space-y-5">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center transition-colors hover:border-primary/40 hover:bg-muted/50">
                <Upload className="size-6 text-primary" />
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Drop files here or click to browse</div>
                  <div className="text-sm text-muted-foreground">PDF, DOC, DOCX, JPG, PNG, TXT, and more</div>
                </div>
                <input
                  type="file"
                  name="files"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.gif"
                  className="hidden"
                  onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
                />
              </label>

              <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                {selectedSummary.length ? (
                  <div className="space-y-2">
                    <div className="font-medium text-foreground">Ready to upload</div>
                    {selectedSummary.map((file) => (
                      <div key={file.name} className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2">
                        <span className="truncate">{file.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{file.size}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>Select files first, then click Next.</div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button asChild type="button" variant="outline">
                  <a href="/app/restaurant/onboarding">
                    <ArrowLeft className="size-4" />
                    Back
                  </a>
                </Button>
                <UploadSubmitButton disabled={!selectedFiles.length} />
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