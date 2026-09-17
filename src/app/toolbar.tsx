"use client";

import { useRef, useTransition } from "react";
import { Download, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { importCsv } from "./actions";

export function Toolbar({ hasLists }: { hasLists: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <input
        ref={input}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const text = await file.text();
          startTransition(async () => {
            try {
              await importCsv(text);
            } catch {
              alert('Import failed. The CSV needs a "title" column.');
            }
          });
        }}
      />
      <Button variant="outline" size="sm" disabled={pending} onClick={() => input.current?.click()}>
        <Upload /> {pending ? "Importing…" : "Import CSV"}
      </Button>
      {hasLists && (
        <a href="/export" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Download /> Export all
        </a>
      )}
    </div>
  );
}
