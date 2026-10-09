create schema if not exists inbox_zero;

create table if not exists inbox_zero.scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 1 and 16),
  score integer not null check (score between 0 and 10000000),
  dodged integer not null default 0 check (dodged between 0 and 100000),
  hits integer not null default 0 check (hits between 0 and 10000),
  won boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists scores_score_idx on inbox_zero.scores (score desc, created_at);

alter table inbox_zero.scores enable row level security;

drop policy if exists "anyone can read scores" on inbox_zero.scores;
create policy "anyone can read scores" on inbox_zero.scores for select to anon, authenticated using (true);

drop policy if exists "anyone can submit a score" on inbox_zero.scores;
create policy "anyone can submit a score" on inbox_zero.scores for insert to anon, authenticated with check (true);

grant usage on schema inbox_zero to anon, authenticated, service_role;
grant select, insert on inbox_zero.scores to anon, authenticated;
grant all on inbox_zero.scores to service_role;

notify pgrst, 'reload schema';
