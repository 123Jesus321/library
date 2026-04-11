/**
 * Общий чат для всех посетителей — данные в Supabase (бесплатный тариф).
 *
 * 1) Создайте проект на https://supabase.com → SQL Editor → выполните:
 *
 *    create table library_chat_messages (
 *      id uuid primary key default gen_random_uuid(),
 *      nick text not null default 'Гость',
 *      body text not null check (char_length(body) <= 500),
 *      created_at timestamptz not null default now()
 *    );
 *    alter table library_chat_messages enable row level security;
 *    create policy "chat_read" on library_chat_messages for select using (true);
 *    create policy "chat_insert" on library_chat_messages for insert with check (true);
 *
 * 2) Project Settings → API: скопируйте URL и anon public key сюда:
 */
window.LIBRARY_CHAT_SUPABASE = {
    url: "https://pjgvkqjgmllfolfwsuoh.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZ3ZrcWpnbWxsZm9sZndzdW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjIwMzcsImV4cCI6MjA5MTQ5ODAzN30.3pnx52tHzt4YBtuB6BQmjdjX20bsEHaam9bK0TNDEuI",
    table: "library_chat_messages"
};
