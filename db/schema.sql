create table if not exists lists (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id text primary key default gen_random_uuid()::text,
  list_id text not null references lists(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  position int not null
);

create index if not exists tasks_list_id_idx on tasks(list_id);
