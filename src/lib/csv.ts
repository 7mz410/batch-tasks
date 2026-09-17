export type Row = { list: string; title: string; done: boolean };

const cell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function toCsv(rows: Row[]) {
  return ["list,title,done", ...rows.map((r) => [cell(r.list), cell(r.title), r.done].join(","))].join("\n");
}

export function parseCsv(text: string): Row[] {
  const records: string[][] = [];
  let rec: string[] = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { rec.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      rec.push(field); records.push(rec); rec = []; field = "";
    } else field += c;
  }
  if (field || rec.length) { rec.push(field); records.push(rec); }

  const [header, ...body] = records;
  if (!header) return [];
  const col = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name);
  const [li, ti, di] = [col("list"), col("title"), col("done")];
  if (ti < 0) throw new Error('CSV needs a "title" column');
  return body
    .map((r) => ({
      list: (li >= 0 && r[li]?.trim()) || "Imported",
      title: r[ti]?.trim() ?? "",
      done: di >= 0 && /^(true|1|yes|x)$/i.test(r[di]?.trim() ?? ""),
    }))
    .filter((r) => r.title);
}
