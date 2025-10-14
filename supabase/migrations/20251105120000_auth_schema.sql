-- Habilitar RLS en todas las tablas
alter table public.members enable row level security;
alter table public.cajas enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.scheduled_expenses enable row level security;
alter table public.categories enable row level security;

-- Eliminar políticas antiguas (si existen)
drop policy if exists "Enable access to all users" on public.members;
drop policy if exists "Enable access to all users" on public.cajas;
drop policy if exists "Enable access to all users" on public.transactions;
drop policy if exists "Enable access to all users" on public.budgets;
drop policy if exists "Enable access to all users" on public.scheduled_expenses;
drop policy if exists "Enable access to all users" on public.categories;

-- Añadir columna user_id a todas las tablas
alter table public.members add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.cajas add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.transactions add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.budgets add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.scheduled_expenses add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.categories add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Crear políticas de seguridad (RLS)
-- Los usuarios pueden ver/modificar sus propios datos
create policy "Users can manage their own members" on public.members for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own cajas" on public.cajas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own transactions" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own budgets" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own scheduled expenses" on public.scheduled_expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own categories" on public.categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Función para migrar datos existentes al primer usuario que se registre
create or replace function public.handle_first_user_migration()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_count integer;
begin
  select count(*) into user_count from auth.users;
  if user_count = 1 then
    update public.members set user_id = new.id where user_id is null;
    update public.cajas set user_id = new.id where user_id is null;
    update public.transactions set user_id = new.id where user_id is null;
    update public.budgets set user_id = new.id where user_id is null;
    update public.scheduled_expenses set user_id = new.id where user_id is null;
    update public.categories set user_id = new.id where user_id is null;
  end if;
  return new;
end;
$$;

-- Trigger que llama a la función después de que un nuevo usuario se inserte en auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_first_user_migration();
