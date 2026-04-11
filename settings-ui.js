(function () {
    const SETTINGS_KEY = "knigi-library-settings-v1";
    const LEGACY_THEME_KEY = "knigi-bg-theme-v1";

    const defaults = () => ({
        bgTheme: "crimson-violet",
        gradientShimmer: true,
        particleMode: "none",
        particleSpeed: 45
    });

    function loadSettings() {
        const s = defaults();
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
                Object.assign(s, JSON.parse(raw));
            } else {
                const old = localStorage.getItem(LEGACY_THEME_KEY);
                if (old) {
                    s.bgTheme = old;
                }
            }
        } catch {
            /* ignore */
        }
        if (!["none", "circles", "lines", "stars"].includes(s.particleMode)) {
            s.particleMode = "none";
        }
        s.particleSpeed = Math.max(5, Math.min(100, Number(s.particleSpeed) || 45));
        return s;
    }

    function saveSettings(partial) {
        const cur = loadSettings();
        Object.assign(cur, partial);
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(cur));
        } catch {
            /* ignore */
        }
        return cur;
    }

    function speedFactor(speedVal) {
        return 0.15 + (speedVal / 100) * 1.85;
    }

    let rafId = null;
    let lastT = 0;
    let particlesState = null;

    function resizeCanvas(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const key = `${w}x${h}@${dpr}`;
        if (canvas.dataset.knigiSize === key) {
            return { w, h, dpr };
        }
        canvas.dataset.knigiSize = key;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        return { w, h, dpr };
    }

    function forceResizeCanvas(canvas) {
        delete canvas.dataset.knigiSize;
        return resizeCanvas(canvas);
    }

    function initParticlesState(w, h, mode) {
        if (mode === "circles") {
            return {
                mode,
                items: Array.from({ length: 28 }, () => ({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: 6 + Math.random() * 28,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: (Math.random() - 0.5) * 1.2
                }))
            };
        }
        if (mode === "lines") {
            const diag = Math.hypot(w, h);
            return {
                mode,
                items: Array.from({ length: 52 }, () => {
                    const halfLen = diag * (0.7 + Math.random() * 0.65);
                    return {
                        cx: (Math.random() - 0.15) * (w * 1.3),
                        cy: (Math.random() - 0.15) * (h * 1.3),
                        halfLen,
                        ang: Math.random() * Math.PI * 2
                    };
                })
            };
        }
        if (mode === "stars") {
            return {
                mode,
                items: Array.from({ length: 55 }, () => ({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: 2 + Math.random() * 5,
                    tw: Math.random() * Math.PI * 2,
                    spd: 0.5 + Math.random()
                }))
            };
        }
        return null;
    }

    function drawStarPath(ctx, x, y, r, rot) {
        ctx.beginPath();
        const spikes = 4;
        for (let i = 0; i < spikes * 2; i += 1) {
            const rad = rot + (i * Math.PI) / spikes;
            const dist = i % 2 === 0 ? r : r * 0.45;
            const px = x + Math.cos(rad) * dist;
            const py = y + Math.sin(rad) * dist;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    }

    function tick(canvas, ctx, settings, t, dt) {
        const sf = speedFactor(settings.particleSpeed);
        const { w, h, dpr } = resizeCanvas(canvas);
        if (settings.particleMode === "none") {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(dpr, dpr);

        if (!particlesState || particlesState.mode !== settings.particleMode) {
            particlesState = initParticlesState(w, h, settings.particleMode);
        }
        if (!particlesState) {
            return;
        }

        const time = t * 0.001 * sf;

        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.fillStyle = "rgba(255,255,255,0.4)";

        if (particlesState.mode === "circles") {
            particlesState.items.forEach((c) => {
                c.x += c.vx * sf * (dt / 16);
                c.y += c.vy * sf * (dt / 16);
                if (c.x < -c.r) {
                    c.x = w + c.r;
                }
                if (c.x > w + c.r) {
                    c.x = -c.r;
                }
                if (c.y < -c.r) {
                    c.y = h + c.r;
                }
                if (c.y > h + c.r) {
                    c.y = -c.r;
                }
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (particlesState.mode === "lines") {
            ctx.lineWidth = 1.65;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            /*
             * Кубическая Безье: контрольные точки смещены вдоль общей нормали — только изгиб, без вращения линий.
             * Угол ln.ang фиксирован после инициализации.
             */
            const tWave = time * 1.06;
            /* Почти на всю меньшую сторону экрана; k ограничен долей хорды — максимальный изгиб без петель на кривой. */
            const baseAmp = Math.min(w, h) * 0.96 * sf;
            const bend = Math.sin(tWave) * baseAmp + Math.cos(tWave * 0.68) * baseAmp * 0.55;
            const alphaWave = 0.22 + Math.sin(tWave) * 0.1;
            particlesState.items.forEach((ln) => {
                const c = Math.cos(ln.ang);
                const s = Math.sin(ln.ang);
                const nx = -s;
                const ny = c;
                const x1 = ln.cx - c * ln.halfLen;
                const y1 = ln.cy - s * ln.halfLen;
                const x2 = ln.cx + c * ln.halfLen;
                const y2 = ln.cy + s * ln.halfLen;
                const chord = 2 * ln.halfLen;
                let k = bend * 6.05;
                const kMax = chord * 0.48;
                if (Math.abs(k) > kMax) {
                    k = Math.sign(k) * kMax;
                }
                const c1x = x1 + c * (chord / 3) + nx * k;
                const c1y = y1 + s * (chord / 3) + ny * k;
                const c2x = x1 + c * ((2 * chord) / 3) + nx * k;
                const c2y = y1 + s * ((2 * chord) / 3) + ny * k;
                ctx.globalAlpha = alphaWave;
                ctx.strokeStyle = "rgba(255,255,255,0.65)";
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
                ctx.stroke();
                ctx.globalAlpha = 0.35;
                ctx.strokeStyle = "rgba(255,255,255,0.55)";
            });
        } else if (particlesState.mode === "stars") {
            particlesState.items.forEach((st) => {
                const pulse = 0.6 + Math.sin(time * st.spd + st.tw) * 0.4;
                ctx.globalAlpha = 0.2 + pulse * 0.35;
                drawStarPath(ctx, st.x, st.y, st.r * pulse, time * 0.3 + st.tw);
                ctx.fill();
                st.x += Math.sin(time * 0.4 + st.tw) * 0.35 * sf;
                st.y += Math.cos(time * 0.35 + st.tw) * 0.28 * sf;
                if (st.x < -20) {
                    st.x = w + 20;
                }
                if (st.x > w + 20) {
                    st.x = -20;
                }
                if (st.y < -20) {
                    st.y = h + 20;
                }
                if (st.y > h + 20) {
                    st.y = -20;
                }
            });
        }

        ctx.globalAlpha = 1;
    }

    function startParticleLoop(canvas, getSettings) {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        lastT = performance.now();

        function frame(now) {
            const settings = getSettings();
            const dt = Math.min(48, now - lastT);
            lastT = now;
            const ctx = canvas.getContext("2d", { alpha: true });
            if (ctx) {
                tick(canvas, ctx, settings, now, dt);
            }
            rafId = requestAnimationFrame(frame);
        }
        rafId = requestAnimationFrame(frame);
    }

    function applyShimmer(el, on, particleSpeed) {
        if (!el) {
            return;
        }
        el.classList.toggle("bg-fx-shimmer--on", !!on);
        const sp = Number(particleSpeed) || 45;
        el.style.animationDuration = `${Math.max(6, 22 - (sp / 100) * 10)}s`;
    }

    function syncFormFromSettings(s) {
        const themeSel = document.getElementById("settings-bg-theme");
        const gradCb = document.getElementById("settings-gradient-shimmer");
        const speedRange = document.getElementById("settings-particle-speed");
        const speedVal = document.getElementById("settings-particle-speed-val");
        if (themeSel) {
            themeSel.value = s.bgTheme;
        }
        if (gradCb) {
            gradCb.checked = !!s.gradientShimmer;
        }
        if (speedRange) {
            speedRange.value = String(s.particleSpeed);
        }
        if (speedVal) {
            speedVal.textContent = String(s.particleSpeed);
        }
        document.querySelectorAll('input[name="settings-particle-mode"]').forEach((inp) => {
            inp.checked = inp.value === s.particleMode;
        });
    }

    function gatherFormSettings() {
        const themeSel = document.getElementById("settings-bg-theme");
        const gradCb = document.getElementById("settings-gradient-shimmer");
        const speedRange = document.getElementById("settings-particle-speed");
        let particleMode = "none";
        document.querySelectorAll('input[name="settings-particle-mode"]').forEach((inp) => {
            if (inp.checked) {
                particleMode = inp.value;
            }
        });
        return {
            bgTheme: themeSel ? themeSel.value : "crimson-violet",
            gradientShimmer: gradCb ? gradCb.checked : true,
            particleMode,
            particleSpeed: speedRange ? Number(speedRange.value) : 45
        };
    }

    function applyAll(s) {
        if (typeof window.applyKnigiBgTheme === "function") {
            window.applyKnigiBgTheme(s.bgTheme);
        }
        document.documentElement.style.setProperty("--knigi-fx-speed", String(s.particleSpeed));

        const shimmer = document.getElementById("bg-fx-shimmer");
        applyShimmer(shimmer, s.gradientShimmer, s.particleSpeed);

        const canvas = document.getElementById("bg-fx-canvas");
        if (canvas) {
            particlesState = null;
        }
    }

    function openPanel(backdrop, panel, btn) {
        backdrop.hidden = false;
        panel.hidden = false;
        if (btn) {
            btn.setAttribute("aria-expanded", "true");
        }
        document.body.classList.add("settings-open");
    }

    function closePanel(backdrop, panel, btn) {
        backdrop.hidden = true;
        panel.hidden = true;
        if (btn) {
            btn.setAttribute("aria-expanded", "false");
        }
        document.body.classList.remove("settings-open");
    }

    function initKnigiSettingsUi() {
        let s = loadSettings();

        const openBtn = document.getElementById("settings-fab");
        const closeBtn = document.getElementById("settings-close");
        const backdrop = document.getElementById("settings-backdrop");
        const panel = document.getElementById("settings-panel");
        const themeSel = document.getElementById("settings-bg-theme");
        const gradCb = document.getElementById("settings-gradient-shimmer");
        const speedRange = document.getElementById("settings-particle-speed");
        const speedVal = document.getElementById("settings-particle-speed-val");

        if (themeSel && window.KnigiBG_THEMES) {
            themeSel.innerHTML = "";
            window.KnigiBG_THEMES.forEach((t) => {
                const o = document.createElement("option");
                o.value = t.id;
                o.textContent = t.label;
                themeSel.appendChild(o);
            });
            themeSel.value = s.bgTheme;
        }

        applyAll(s);
        syncFormFromSettings(s);

        function persistFromForm() {
            s = saveSettings(gatherFormSettings());
            applyAll(s);
        }

        const canvas = document.getElementById("bg-fx-canvas");
        if (canvas) {
            window.addEventListener(
                "resize",
                () => {
                    forceResizeCanvas(canvas);
                    particlesState = null;
                },
                { passive: true }
            );
            startParticleLoop(canvas, () => loadSettings());
        }

        if (openBtn && backdrop && panel) {
            openBtn.addEventListener("click", () => openPanel(backdrop, panel, openBtn));
            backdrop.addEventListener("click", () => closePanel(backdrop, panel, openBtn));
            closeBtn?.addEventListener("click", () => closePanel(backdrop, panel, openBtn));
        }

        themeSel?.addEventListener("change", persistFromForm);
        gradCb?.addEventListener("change", persistFromForm);
        speedRange?.addEventListener("input", () => {
            if (speedVal) {
                speedVal.textContent = speedRange.value;
            }
            persistFromForm();
        });
        document.querySelectorAll('input[name="settings-particle-mode"]').forEach((inp) => {
            inp.addEventListener("change", persistFromForm);
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && panel && !panel.hidden) {
                closePanel(backdrop, panel, openBtn);
            }
        });
    }

    window.initKnigiSettingsUi = initKnigiSettingsUi;
    initKnigiSettingsUi();
})();
