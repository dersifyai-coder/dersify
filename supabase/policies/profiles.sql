-- RLS policies for the profiles table.
-- Table structure is managed by Prisma migrations.
-- Apply this file manually via the Supabase SQL editor or Supabase CLI
-- after running: pnpm db:migrate

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Profiles are viewable by owner'
  ) then
    create policy "Profiles are viewable by owner"
      on public.profiles
      for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Profiles are insertable by owner'
  ) then
    create policy "Profiles are insertable by owner"
      on public.profiles
      for insert
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Profiles are editable by owner'
  ) then
    create policy "Profiles are editable by owner"
      on public.profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;
