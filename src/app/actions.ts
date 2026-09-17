"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { parseCsv } from "@/lib/csv";
import type { Shared } from "@/lib/share";

const lines = (text: string) => text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

async function newList(name: string, tasks: { title: string; done?: boolean }[]) {
  const [list] = await sql`insert into lists (name) values (${name.trim() || "Untitled list"}) returning id`;
  await appendTasks(list.id, tasks);
}

async function appendTasks(listId: string, tasks: { title: string; done?: boolean }[]) {
  if (!tasks.length) return;
  await sql`
    insert into tasks (list_id, title, done, position)
    select ${listId}, t.title, t.done,
      (select coalesce(max(position), -1) from tasks where list_id = ${listId}) + t.ord
    from unnest(${tasks.map((t) => t.title)}::text[], ${tasks.map((t) => t.done ?? false)}::boolean[])
      with ordinality as t(title, done, ord)`;
}

export async function createList(formData: FormData) {
  await newList(String(formData.get("name") ?? ""), lines(String(formData.get("tasks") ?? "")).map((title) => ({ title })));
  revalidatePath("/");
}

export async function addTasks(listId: string, formData: FormData) {
  await appendTasks(listId, lines(String(formData.get("tasks") ?? "")).map((title) => ({ title })));
  revalidatePath("/");
}

export async function toggleTask(id: string, done: boolean) {
  await sql`update tasks set done = ${done} where id = ${id}`;
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await sql`delete from tasks where id = ${id}`;
  revalidatePath("/");
}

export async function deleteList(id: string) {
  await sql`delete from lists where id = ${id}`;
  revalidatePath("/");
}

export async function importCsv(text: string) {
  const groups = new Map<string, { title: string; done: boolean }[]>();
  for (const r of parseCsv(text)) groups.set(r.list, [...(groups.get(r.list) ?? []), r]);
  for (const [name, tasks] of groups) await newList(name, tasks);
  revalidatePath("/");
}

export async function importShared(data: Shared) {
  await newList(data.name, data.tasks);
  revalidatePath("/");
  redirect("/");
}
