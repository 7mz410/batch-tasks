"use client";

import { useState } from "react";
import { Check, Download, Link2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { toCsv } from "@/lib/csv";
import { encodeShare } from "@/lib/share";
import { addTasks, deleteList, deleteTask, downloadCsv, toggleTask, type List } from "@/lib/store";

export function ListCard({ list }: { list: List }) {
  const { id, name, tasks } = list;
  const [copied, setCopied] = useState(false);

  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const share = async () => {
    const d = encodeShare({ name, tasks: tasks.map(({ title, done }) => ({ title, done })) });
    const url = `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/share/?d=${d}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
      } catch {}
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="rounded-xl border bg-card p-5 shadow-xs">
      <header className="mb-4 flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold break-words">{name}</h2>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" onClick={share} aria-label="Share list" title="Share list">
            {copied ? <Check /> : <Link2 />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Export CSV"
            title="Export CSV"
            onClick={() => downloadCsv(name, toCsv(tasks.map((t) => ({ list: name, title: t.title, done: t.done }))))}
          >
            <Download />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete list"
            title="Delete list"
            onClick={() => confirm(`Delete "${name}"?`) && deleteList(id)}
          >
            <Trash2 />
          </Button>
        </div>
      </header>

      <Progress value={pct} className="mb-4 [&_[data-slot=progress-track]]:h-2">
        <ProgressLabel>
          {done}/{tasks.length} done
        </ProgressLabel>
        <ProgressValue />
      </Progress>

      <ul className="mb-4 space-y-1">
        {tasks.map((t) => (
          <li key={t.id} className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50">
            <Checkbox id={t.id} checked={t.done} onCheckedChange={(checked) => toggleTask(id, t.id, checked)} />
            <label
              htmlFor={t.id}
              className={`flex-1 cursor-pointer text-sm transition-colors ${t.done ? "text-muted-foreground line-through" : ""}`}
            >
              {t.title}
            </label>
            <button
              onClick={() => deleteTask(id, t.id)}
              aria-label={`Delete ${t.title}`}
              className="text-muted-foreground hover:text-foreground md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <details>
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">Add tasks</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTasks(id, String(new FormData(e.currentTarget).get("tasks")));
            e.currentTarget.reset();
          }}
          className="mt-2 space-y-2"
        >
          <Textarea name="tasks" rows={4} placeholder={"One task per line\nPaste as many as you want"} required />
          <Button type="submit" size="sm">Add</Button>
        </form>
      </details>
    </section>
  );
}
