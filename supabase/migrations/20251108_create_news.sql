-- Create news table
create table news (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references auth.users(id)
);

-- Enable Row Level Security (RLS)
alter table news enable row level security;

-- Create policies
create policy "Anyone can read news" on news
  for select using (true);

create policy "Authenticated users can create news" on news
  for insert with check (auth.role() = 'authenticated');

-- Create index for faster sorting
create index news_created_at_idx on news(created_at desc);