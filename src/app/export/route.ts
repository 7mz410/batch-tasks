import { getLists } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("list") ?? undefined;
  const lists = await getLists(id);
  const rows = lists.flatMap((l) => l.tasks.map((t) => ({ list: l.name, title: t.title, done: t.done })));
  const file = (id && lists[0]?.name.replace(/[^\w-]+/g, "_")) || "tasks";
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${file}.csv"`,
    },
  });
}
