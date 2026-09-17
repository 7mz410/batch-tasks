"use client";

import { useSyncExternalStore } from "react";
import type { Row } from "./csv";
import type { Shared } from "./share";

export type Task = { id: string; title: string; done: boolean };
export type List = { id: string; name: string; tasks: Task[] };

const KEY = "batch-tasks";
const EMPTY: List[] = [];
const subs = new Set<() => void>();
let lists: List[] | null = null;

function get() {
  if (lists === null) {
    try {
      lists = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      lists = [];
    }
  }
  return lists!;
}

function set(next: List[]) {
  lists = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  subs.forEach((f) => f());
}

export function useLists() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    get,
    () => EMPTY,
  );
}

const lines = (text: string) => text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const task = (title: string, done = false): Task => ({ id: crypto.randomUUID(), title, done });
const newList = (name: string, tasks: Task[]): List => ({ id: crypto.randomUUID(), name: name.trim() || "Untitled list", tasks });
const updateList = (id: string, fn: (l: List) => List) => set(get().map((l) => (l.id === id ? fn(l) : l)));

export const createList = (name: string, text: string) => set([newList(name, lines(text).map((t) => task(t))), ...get()]);

export const addTasks = (id: string, text: string) =>
  updateList(id, (l) => ({ ...l, tasks: [...l.tasks, ...lines(text).map((t) => task(t))] }));

export const toggleTask = (id: string, taskId: string, done: boolean) =>
  updateList(id, (l) => ({ ...l, tasks: l.tasks.map((t) => (t.id === taskId ? { ...t, done } : t)) }));

export const deleteTask = (id: string, taskId: string) =>
  updateList(id, (l) => ({ ...l, tasks: l.tasks.filter((t) => t.id !== taskId) }));

export const deleteList = (id: string) => set(get().filter((l) => l.id !== id));

export function importRows(rows: Row[]) {
  const groups = new Map<string, Row[]>();
  for (const r of rows) groups.set(r.list, [...(groups.get(r.list) ?? []), r]);
  set([...[...groups].map(([name, rs]) => newList(name, rs.map((r) => task(r.title, r.done)))), ...get()]);
  return groups.size;
}

export const importShared = (data: Shared) => set([newList(data.name, data.tasks.map((t) => task(t.title, t.done))), ...get()]);

export function downloadCsv(filename: string, csv: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `${filename.replace(/[^\w-]+/g, "_") || "tasks"}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
