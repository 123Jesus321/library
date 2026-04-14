(function () {
    const cfg = window.LIBRARY_CHAT_SUPABASE || {};
    const baseUrl = String(cfg.url || "").replace(/\/$/, "");
    const anonKey = cfg.anonKey || "";
    const table = cfg.table || "library_chat_messages";
    const bansTable = cfg.bansTable || "library_chat_bans";
    const moderatorSecret = String(cfg.moderatorSecret || "");

    function normalizeNick(str) {
        return String(str || "")
            .trim()
            .toLocaleLowerCase("ru-RU");
    }

    const modNickNormalized = normalizeNick(cfg.modNick || "Сумасшедший");

    const root = document.getElementById("library-chat");
    if (!root) {
        return;
    }

    const panel = document.getElementById("library-chat-panel");
    const toggle = document.getElementById("library-chat-toggle");
    const listEl = document.getElementById("library-chat-messages");
    const form = document.getElementById("library-chat-form");
    const input = document.getElementById("library-chat-input");
    const nickInput = document.getElementById("library-chat-nick");
    const statusEl = document.getElementById("library-chat-status");
    const modSection = document.getElementById("library-chat-mod");
    const modHint = document.getElementById("library-chat-mod-hint");
    const banListEl = document.getElementById("library-chat-ban-list");

    const NICK_KEY = "knigi-chat-nick";
    const CHAT_RULES_SHOWN_KEY = "knigi-chat-rules-shown-v1";
    let pollTimer = null;
    let configured = !!(baseUrl && anonKey);
    const modSecretOk = moderatorSecret.length >= 8;

    function isModeratorSession() {
        if (!modSecretOk || !nickInput) {
            return false;
        }
        return normalizeNick(nickInput.value) === modNickNormalized;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function escapeAttr(str) {
        return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    }

    function formatTime(iso) {
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) {
                return "";
            }
            return d.toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return "";
        }
    }

    function setStatus(text, isError) {
        if (!statusEl) {
            return;
        }
        statusEl.hidden = !text;
        statusEl.textContent = text || "";
        statusEl.classList.toggle("library-chat-status--error", !!isError);
    }

    function applyConfiguredUi() {
        if (!form || !input || !nickInput) {
            return;
        }
        if (!configured) {
            setStatus(
                "Чат выключен: укажите url и anonKey в файле chat-config.js (инструкция внутри файла).",
                true
            );
            input.disabled = true;
            nickInput.disabled = true;
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
        }
    }

    function restHeaders() {
        return {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
        };
    }

    async function rpcVoid(name, body) {
        const res = await fetch(`${baseUrl}/rest/v1/rpc/${encodeURIComponent(name)}`, {
            method: "POST",
            headers: restHeaders(),
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            let msg = `Запрос: ${res.status}`;
            try {
                const j = await res.json();
                if (j && j.message) {
                    msg = j.message;
                }
            } catch {
                try {
                    const t = await res.text();
                    if (t) {
                        msg = t.slice(0, 200);
                    }
                } catch {
                    /* ignore */
                }
            }
            throw new Error(msg);
        }
    }

    async function fetchMessages() {
        if (!configured) {
            return;
        }
        const q = `${baseUrl}/rest/v1/${encodeURIComponent(table)}?select=id,nick,body,created_at,ip_hash&order=created_at.asc&limit=80`;
        const res = await fetch(q, {
            headers: {
                ...restHeaders(),
                Accept: "application/json"
            }
        });
        if (!res.ok) {
            throw new Error(`Ошибка загрузки: ${res.status}`);
        }
        const rows = await res.json();
        if (!Array.isArray(rows)) {
            return;
        }
        const showMod = isModeratorSession();
        listEl.innerHTML = rows.map((row) => renderMessage(row, showMod)).join("");
        listEl.scrollTop = listEl.scrollHeight;
        syncModPanel();
    }

    function renderMessage(row, showMod) {
        const t = formatTime(row.created_at);
        const nick = row.nick || "Гость";
        const idAttr = escapeAttr(String(row.id));
        const nickAttr = escapeAttr(nick);
        const ipHashAttr = escapeAttr(String(row.ip_hash || ""));
        const actions =
            showMod && modSecretOk
                ? `<span class="library-chat-msg-actions">
            <button type="button" class="library-chat-msg-btn library-chat-msg-del" data-msg-id="${idAttr}" title="Удалить сообщение">✕</button>
            <button type="button" class="library-chat-msg-btn library-chat-msg-ban" data-ban-msg-id="${idAttr}" data-ban-nick="${nickAttr}" data-ban-ip-hash="${ipHashAttr}" title="Забанить автора по IP">🚫</button>
        </span>`
                : "";
        return `<li class="library-chat-msg" data-id="${escapeAttr(String(row.id))}">
            <span class="library-chat-msg-line">
                <span class="library-chat-msg-meta">${escapeHtml(nick)} · ${escapeHtml(t)}</span>
                ${actions}
            </span>
            <span class="library-chat-msg-body">${escapeHtml(row.body || "")}</span>
        </li>`;
    }

    async function fetchBanList() {
        if (!configured || !banListEl || !isModeratorSession() || !modSecretOk) {
            if (banListEl) {
                banListEl.innerHTML = "";
            }
            return;
        }
        const q = `${baseUrl}/rest/v1/${encodeURIComponent(bansTable)}?select=ip_hash,created_at&order=created_at.desc`;
        const res = await fetch(q, {
            headers: {
                ...restHeaders(),
                Accept: "application/json"
            }
        });
        if (!res.ok) {
            banListEl.innerHTML = `<li class="library-chat-ban-item">Не удалось загрузить баны (${res.status}). Выполните SQL из chat-config.js.</li>`;
            return;
        }
        const rows = await res.json();
        if (!Array.isArray(rows) || rows.length === 0) {
            banListEl.innerHTML = `<li class="library-chat-ban-item library-chat-ban-empty">Нет активных IP-банов.</li>`;
            return;
        }
        banListEl.innerHTML = rows
            .map((r) => {
                const hash = String(r.ip_hash || "");
                const nn = escapeAttr(hash);
                const when = escapeHtml(formatTime(r.created_at));
                const shortHash = hash ? `${hash.slice(0, 10)}…` : "—";
                return `<li class="library-chat-ban-item">
                <span class="library-chat-ban-nick">IP hash: ${escapeHtml(shortHash)}</span>
                <span class="library-chat-ban-when">${when}</span>
                <button type="button" class="library-chat-msg-btn library-chat-unban" data-unban-nick="${nn}">Снять</button>
            </li>`;
            })
            .join("");
    }

    function syncModPanel() {
        if (!modSection) {
            return;
        }
        const show = configured && isModeratorSession();
        modSection.hidden = !show;
        if (modHint) {
            if (show && !modSecretOk) {
                modHint.hidden = false;
                modHint.textContent =
                    "Задайте moderatorSecret в chat-config.js (тот же текст, что YOUR_LONG_SECRET в SQL) — иначе удаление и бан не сработают.";
            } else {
                modHint.hidden = true;
                modHint.textContent = "";
            }
        }
        if (show) {
            fetchBanList().catch(() => {});
        } else if (banListEl) {
            banListEl.innerHTML = "";
        }
    }

    async function sendMessage(nick, body) {
        const payload = [{ nick: nick || "Гость", body: body.trim() }];
        const res = await fetch(`${baseUrl}/rest/v1/${encodeURIComponent(table)}`, {
            method: "POST",
            headers: restHeaders(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const errText = await res.text();
            if (res.status === 401 || res.status === 403 || /policy|rls|row-level/i.test(errText)) {
                throw new Error("Не удалось отправить: возможно, этот ник в бане или политика чата не обновлена.");
            }
            throw new Error(errText || `Отправка: ${res.status}`);
        }
    }

    function startPolling() {
        if (!configured || pollTimer) {
            return;
        }
        fetchMessages().catch((e) => setStatus(e.message || "Сеть", true));
        pollTimer = window.setInterval(() => {
            fetchMessages().catch(() => {});
        }, 4000);
    }

    function syncChatToggleUi() {
        if (!toggle || !panel || !root) {
            return;
        }
        const isOpen = root.classList.contains("library-chat--open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        toggle.textContent = isOpen ? "▼ Скрыть чат" : "💬 Открыть чат";
    }

    if (toggle && panel) {
        syncChatToggleUi();

        toggle.addEventListener("click", () => {
            const willOpen = !root.classList.contains("library-chat--open");
            root.classList.toggle("library-chat--open", willOpen);
            syncChatToggleUi();
            if (willOpen && configured) {
                try {
                    if (!localStorage.getItem(CHAT_RULES_SHOWN_KEY)) {
                        window.alert(
                            "Здравствуйте, дорогие читатели!\n\n" +
                                "Правила чата:\n" +
                                "1) Запрещены мат, оскорбления, травля, унижение участников, писателей и комиссии.\n" +
                                "2) Запрещены пропаганда нетрадиционных ценностей, экстремизма, терроризма и распространение подобных материалов.\n" +
                                "3) Запрещены угрозы, призывы к насилию, спам, флуд и намеренное засорение чата.\n" +
                                "4) За нарушения применяется блокировка доступа к чату."
                        );
                        localStorage.setItem(CHAT_RULES_SHOWN_KEY, "1");
                    }
                } catch {
                    /* ignore */
                }
                fetchMessages().catch(() => {});
            }
        });
    }

    if (nickInput) {
        try {
            nickInput.value = localStorage.getItem(NICK_KEY) || nickInput.placeholder || "";
        } catch {
            /* ignore */
        }
        nickInput.addEventListener("change", () => {
            try {
                localStorage.setItem(NICK_KEY, nickInput.value.slice(0, 32));
            } catch {
                /* ignore */
            }
            if (configured && listEl) {
                fetchMessages().catch(() => {});
            }
        });
    }

    if (listEl) {
        listEl.addEventListener("click", async (e) => {
            const del = e.target.closest(".library-chat-msg-del");
            if (del && listEl.contains(del)) {
                e.preventDefault();
                e.stopPropagation();
                if (!isModeratorSession() || !modSecretOk) {
                    return;
                }
                const mid = del.getAttribute("data-msg-id");
                if (!mid || !window.confirm("Удалить это сообщение?")) {
                    return;
                }
                setStatus("Удаление…", false);
                try {
                    await rpcVoid("chat_mod_delete_message", {
                        p_secret: moderatorSecret,
                        p_msg_id: mid
                    });
                    setStatus("");
                    await fetchMessages();
                } catch (err) {
                    setStatus(err.message || "Не удалось удалить", true);
                }
                return;
            }
            const ban = e.target.closest(".library-chat-msg-ban");
            if (ban && listEl.contains(ban)) {
                e.preventDefault();
                e.stopPropagation();
                if (!isModeratorSession() || !modSecretOk) {
                    return;
                }
                const targetNick = ban.getAttribute("data-ban-nick") || "Гость";
                const msgId = ban.getAttribute("data-ban-msg-id");
                if (
                    !msgId ||
                    !window.confirm(`Забанить автора «${targetNick}» по IP? Сообщения с этого адреса будут блокироваться.`)
                ) {
                    return;
                }
                setStatus("Бан…", false);
                try {
                    await rpcVoid("chat_mod_ban_ip_by_message", {
                        p_secret: moderatorSecret,
                        p_msg_id: msgId
                    });
                    setStatus("");
                    await fetchMessages();
                } catch (err) {
                    setStatus(err.message || "Не удалось забанить", true);
                }
            }
        });
    }

    if (banListEl) {
        banListEl.addEventListener("click", async (e) => {
            const btn = e.target.closest(".library-chat-unban");
            if (!btn || !banListEl.contains(btn)) {
                return;
            }
            e.preventDefault();
            if (!isModeratorSession() || !modSecretOk) {
                return;
            }
            const nn = btn.getAttribute("data-unban-nick");
            if (!nn || !window.confirm("Снять IP-бан?")) {
                return;
            }
            setStatus("Снятие бана…", false);
            try {
                await rpcVoid("chat_mod_unban_ip", {
                    p_secret: moderatorSecret,
                    p_ip_hash: nn
                });
                setStatus("");
                await fetchBanList();
            } catch (err) {
                setStatus(err.message || "Не удалось снять бан", true);
            }
        });
    }

    if (form && input) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!configured) {
                return;
            }
            const text = input.value.trim();
            if (!text) {
                return;
            }
            const nick = (nickInput && nickInput.value.trim()) || "Гость";
            try {
                localStorage.setItem(NICK_KEY, nick.slice(0, 32));
            } catch {
                /* ignore */
            }
            setStatus("Отправка…", false);
            try {
                await sendMessage(nick, text);
                input.value = "";
                setStatus("");
                await fetchMessages();
            } catch (err) {
                setStatus(err.message || "Не удалось отправить", true);
            }
        });
    }

    applyConfiguredUi();
    if (configured) {
        startPolling();
    }
})();
