"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { decodeShare } from "@/lib/share";
import { importShared } from "@/lib/store";

const noop = () => () => {};

export default function SharePage() {
  const router = useRouter();
  const d = useSyncExternalStore(noop, () => new URLSearchParams(location.search).get("d"), () => undefined);
  if (d === undefined) return null;
  const data = d ? decodeShare(d) : null;

  if (!data) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 text-center">
        <p className="mb-4">This share link is broken.</p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>Go home</Link>
      </main>
    );
  }

  const done = data.tasks.filter((t) => t.done).length;
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <p className="mb-1 text-sm text-muted-foreground">Shared list</p>
      <h1 className="mb-1 text-2xl font-bold">{data.name}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {done}/{data.tasks.length} done
      </p>
      <ul className="mb-6 space-y-1 rounded-xl border bg-card p-5">
        {data.tasks.map((t, i) => (
          <li key={i} className={`text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}>
            {t.title}
          </li>
        ))}
      </ul>
      <Button
        onClick={() => {
          importShared(data);
          router.push("/");
        }}
      >
        Import as new list
      </Button>
    </main>
  );
}
