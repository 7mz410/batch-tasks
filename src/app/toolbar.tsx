"use client";

import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseCsv, toCsv } from "@/lib/csv";
import { downloadCsv, importRows, type List } from "@/lib/store";

export function Toolbar({ lists }: { lists: List[] }) {
  const input = useRef<HTMLInputElement>(null);
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
          try {
            importRows(parseCsv(await file.text()));
          } catch (err) {
            alert(err instanceof Error ? err.message : "Import failed");
          }
        }}
      />
      <Button variant="outline" size="sm" onClick={() => input.current?.click()}>
        <Upload /> Import CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!lists.length}
        onClick={() =>
          downloadCsv("tasks", toCsv(lists.flatMap((l) => l.tasks.map((t) => ({ list: l.name, title: t.title, done: t.done })))))
        }
      >
        <Download /> Export all
      </Button>
    </div>
  );
}
