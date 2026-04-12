/**
 * Общий чат для всех посетителей — данные в Supabase (бесплатный тариф).
 *
 * ВАЖНО: не копируйте SQL из этого комментария в редактор — в начале строк остаётся символ «*», из‑за него ошибка 42601.
 * Откройте рядом файл supabase-chat-setup.sql: замените YOUR_LONG_SECRET на свой секрет (как moderatorSecret ниже),
 * затем вставьте весь файл в Supabase → SQL Editor → Run.
 *
 * 1) Альтернатива — вручную выполнить скрипт (одним блоком, секрет вместо YOUR_LONG_SECRET, ≥8 символов):
 *
 *    create table library_chat_messages (
 *      id uuid primary key default gen_random_uuid(),
 *      nick text not null default 'Гость',
 *      body text not null check (char_length(body) <= 500),
 *      created_at timestamptz not null default now()
 *    );
 *    alter table library_chat_messages enable row level security;
 *    create policy "chat_read" on library_chat_messages for select using (true);
 *
 *    create table library_chat_bans (
 *      nick text primary key,
 *      created_at timestamptz not null default now()
 *    );
 *    alter table library_chat_bans enable row level security;
 *    create policy "bans_read" on library_chat_bans for select using (true);
 *
 *    drop policy if exists "chat_insert" on library_chat_messages;
 *    create policy "chat_insert" on library_chat_messages for insert with check (
 *      not exists (select 1 from library_chat_bans b where b.nick = lower(trim(nick)))
 *    );
 *
 *    create or replace function public.chat_mod_delete_message(p_secret text, p_msg_id uuid)
 *    returns void language plpgsql security definer set search_path = public as $$
 *    begin
 *      if p_secret is distinct from 'YOUR_LONG_SECRET' or length(trim(coalesce(p_secret,''))) < 8 then
 *        raise exception 'forbidden';
 *      end if;
 *      delete from library_chat_messages where id = p_msg_id;
 *    end;
 *    $$;
 *    grant execute on function public.chat_mod_delete_message(text, uuid) to anon, authenticated;
 *
 *    create or replace function public.chat_mod_ban_nick(p_secret text, p_nick text)
 *    returns void language plpgsql security definer set search_path = public as $$
 *    begin
 *      if p_secret is distinct from 'YOUR_LONG_SECRET' or length(trim(coalesce(p_secret,''))) < 8 then
 *        raise exception 'forbidden';
 *      end if;
 *      insert into library_chat_bans (nick) values (lower(trim(p_nick))) on conflict (nick) do nothing;
 *    end;
 *    $$;
 *    grant execute on function public.chat_mod_ban_nick(text, text) to anon, authenticated;
 *
 *    create or replace function public.chat_mod_unban_nick(p_secret text, p_nick text)
 *    returns void language plpgsql security definer set search_path = public as $$
 *    begin
 *      if p_secret is distinct from 'YOUR_LONG_SECRET' or length(trim(coalesce(p_secret,''))) < 8 then
 *        raise exception 'forbidden';
 *      end if;
 *      delete from library_chat_bans where nick = lower(trim(p_nick));
 *    end;
 *    $$;
 *    grant execute on function public.chat_mod_unban_nick(text, text) to anon, authenticated;
 *
 * 2) Project Settings → API: скопируйте URL и anon public key сюда.
 *
 * 3) moderatorSecret — тот же текст, что YOUR_LONG_SECRET в SQL (виден в исходнике страницы; для строгой защиты нужен сервер / Edge Function).
 *    modNick — ник модератора в поле «Имя» (без учёта регистра), по умолчанию «Сумасшедший».
 */
window.LIBRARY_CHAT_SUPABASE = {
    url: "https://pjgvkqjgmllfolfwsuoh.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZ3ZrcWpnbWxsZm9sZndzdW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjIwMzcsImV4cCI6MjA5MTQ5ODAzN30.3pnx52tHzt4YBtuB6BQmjdjX20bsEHaam9bK0TNDEuI",
    table: "library_chat_messages",
    bansTable: "library_chat_bans",
    /** Тот же секрет, что в функциях SQL (замените в обоих местах). */
    moderatorSecret: "Сумасшедший",
    /** Ник в чате для показа кнопок модерации (сравнение без учёта регистра). */
    modNick: "Сумасшедший"
};
