import { connection } from "next/server";
import { getLists } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createList } from "./actions";
import { ListCard } from "./list-card";
import { Toolbar } from "./toolbar";

export default async function Home() {
  await connection();
  const lists = await getLists();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Batch Tasks</h1>
        <Toolbar hasLists={lists.length > 0} />
      </div>

      <form action={createList} className="mb-10 space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-semibold">New list</h2>
        <Input name="name" placeholder="List name" />
        <Textarea name="tasks" rows={6} placeholder={"Paste tasks, one per line\nBuy milk\nCall mom\nShip v1"} />
        <Button type="submit">Create list</Button>
      </form>

      {lists.length === 0 ? (
        <p className="text-center text-muted-foreground">No lists yet. Paste some tasks above.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lists.map((l) => (
            <ListCard key={l.id} list={l} />
          ))}
        </div>
      )}
    </main>
  );
}
