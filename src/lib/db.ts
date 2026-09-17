import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export type Task = { id: string; title: string; done: boolean };
export type List = { id: string; name: string; tasks: Task[] };

export async function getLists(id?: string): Promise<List[]> {
  const rows = await sql`
    select l.id, l.name,
      coalesce(json_agg(json_build_object('id', t.id, 'title', t.title, 'done', t.done) order by t.position)
        filter (where t.id is not null), '[]') as tasks
    from lists l left join tasks t on t.list_id = l.id
    where ${id ?? null}::text is null or l.id = ${id ?? null}
    group by l.id
    order by l.created_at desc`;
  return rows as List[];
}
