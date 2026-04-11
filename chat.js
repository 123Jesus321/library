(function () {
    const cfg = window.LIBRARY_CHAT_SUPABASE || {};
    const baseUrl = String(cfg.url || "").replace(/\/$/, "");
    const anonKey = cfg.anonKey || "";
    const table = cfg.table || "library_chat_messages";

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

    const NICK_KEY = "knigi-chat-nick";
    let pollTimer = null;
    let configured = !!(baseUrl && anonKey);

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
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

    async function fetchMessages() {
        if (!configured) {
            return;
        }
        const q = `${baseUrl}/rest/v1/${encodeURIComponent(table)}?select=id,nick,body,created_at&order=created_at.asc&limit=80`;
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
        listEl.innerHTML = rows.map((row) => renderMessage(row)).join("");
        listEl.scrollTop = listEl.scrollHeight;
    }

    function renderMessage(row) {
        const t = formatTime(row.created_at);
        return `<li class="library-chat-msg" data-id="${escapeHtml(row.id)}">
            <span class="library-chat-msg-meta">${escapeHtml(row.nick || "Гость")} · ${escapeHtml(t)}</span>
            <span class="library-chat-msg-body">${escapeHtml(row.body || "")}</span>
        </li>`;
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

    if (toggle && panel) {
        toggle.addEventListener("click", () => {
            const open = panel.hidden;
            panel.hidden = !open;
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            if (open && configured) {
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
