-- Roles
create type public.app_role as enum ('buyer','seller','admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  business_name text,
  location text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, business_name, location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'business_name',
    new.raw_user_meta_data ->> 'location'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when coalesce(new.raw_user_meta_data ->> 'role','buyer') = 'seller'
      then 'seller'::public.app_role else 'buyer'::public.app_role end
  )
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null default 'grains',
  price numeric(10,2) not null default 0,
  unit text not null default 'kg',
  stock integer not null default 0,
  image_url text,
  location text,
  organic boolean not null default false,
  harvest_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.products to authenticated;
grant select on public.products to anon;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "active products public" on public.products for select to anon, authenticated using (is_active = true);
create policy "seller reads own products" on public.products for select to authenticated using (auth.uid() = seller_id);
create policy "seller inserts own products" on public.products for insert to authenticated
  with check (auth.uid() = seller_id and public.has_role(auth.uid(),'seller'));
create policy "seller updates own products" on public.products for update to authenticated
  using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "seller deletes own products" on public.products for delete to authenticated using (auth.uid() = seller_id);
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();
create index products_seller_idx on public.products(seller_id);
create index products_category_idx on public.products(category);

-- Cart
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
grant select, insert, update, delete on public.cart_items to authenticated;
grant all on public.cart_items to service_role;
alter table public.cart_items enable row level security;
create policy "own cart" on public.cart_items for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Wishlist
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
grant select, insert, update, delete on public.wishlist_items to authenticated;
grant all on public.wishlist_items to service_role;
alter table public.wishlist_items enable row level security;
create policy "own wishlist" on public.wishlist_items for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  total numeric(10,2) not null default 0,
  status text not null default 'pending',
  shipping_address text not null default '',
  contact_phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  unit_price numeric(10,2) not null default 0,
  quantity integer not null default 1,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create index order_items_order_idx on public.order_items(order_id);
create index order_items_seller_idx on public.order_items(seller_id);

create or replace function public.seller_in_order(_order_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.order_items where order_id = _order_id and seller_id = _user_id)
$$;

create policy "buyer reads own orders" on public.orders for select to authenticated using (auth.uid() = buyer_id);
create policy "seller reads related orders" on public.orders for select to authenticated
  using (public.seller_in_order(id, auth.uid()));
create policy "buyer creates orders" on public.orders for insert to authenticated with check (auth.uid() = buyer_id);
create policy "buyer updates own orders" on public.orders for update to authenticated
  using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

create policy "buyer reads own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()));
create policy "seller reads own order items" on public.order_items for select to authenticated
  using (auth.uid() = seller_id);
create policy "buyer inserts order items" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()));
create policy "seller updates own order items" on public.order_items for update to authenticated
  using (auth.uid() = seller_id) with check (auth.uid() = seller_id);