(function () {
    const STORAGE_KEY = "knigi-wave-speed-v1";
    const DEFAULT_SPEED = 24;

    const canvasId = "knigi-wave-canvas";
    let canvas;
    let ctx;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;
    let lastTs = 0;
    let rafId = 0;
    let lines = [];
    let drawOrder = [];
    let speedValue = DEFAULT_SPEED;
    let reducedMotion = false;

    function readSpeed() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw == null) {
                return DEFAULT_SPEED;
            }
            const n = parseInt(raw, 10);
            if (n >= 1 && n <= 100) {
                return n;
            }
        } catch {
            /* ignore */
        }
        return DEFAULT_SPEED;
    }

    function writeSpeed(n) {
        try {
            localStorage.setItem(STORAGE_KEY, String(n));
        } catch {
            /* ignore */
        }
    }

    function getMultiplier() {
        return 0.006 + (speedValue / 100) * 0.58;
    }

    function mulberry32(a) {
        return function () {
            let t = (a += 0x6d2b79f5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function shuffleSeeded(arr, seed) {
        const rnd = mulberry32(seed >>> 0);
        for (let i = arr.length - 1; i > 0; i -= 1) {
            const j = Math.floor(rnd() * (i + 1));
            const t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;
        }
    }

    function buildLines() {
        const n = Math.min(48, Math.max(22, Math.round(26 + width / 100)));
        lines = [];
        for (let i = 0; i < n; i += 1) {
            const rnd = mulberry32(i * 977 + 1337 + width + height * 17);
            lines.push({
                a1: 5 + rnd() * 26,
                a2: 4 + rnd() * 18,
                a3: 2 + rnd() * 14,
                k1: 0.006 + rnd() * 0.02,
                k2: 0.01 + rnd() * 0.024,
                k3: 0.016 + rnd() * 0.034,
                w1: 0.22 + rnd() * 0.75,
                w2: 0.35 + rnd() * 1.05,
                w3: 0.18 + rnd() * 0.62,
                p1: rnd() * Math.PI * 2,
                p2: rnd() * Math.PI * 2,
                p3: rnd() * Math.PI * 2,
                vJitter: (rnd() - 0.5) * 36,
                alpha: 0.88 + rnd() * 0.12,
                lw: 1.05 + (rnd() > 0.55 ? 0.4 : 0)
            });
        }
        drawOrder = lines.map((_, i) => i);
        shuffleSeeded(drawOrder, (width * 928371 + height * 48127 + lines.length * 17) >>> 0);
    }

    function ensureCanvas() {
        if (canvas) {
            return;
        }
        let el = document.getElementById(canvasId);
        if (!el) {
            el = document.createElement("canvas");
            el.id = canvasId;
            el.setAttribute("aria-hidden", "true");
            document.body.insertBefore(el, document.body.firstChild);
        }
        canvas = el;
        ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    }

    function resize() {
        ensureCanvas();
        width = window.innerWidth || 1;
        height = window.innerHeight || 1;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        buildLines();
    }

    function render(incTime, dt) {
        if (!ctx || !lines.length) {
            return;
        }
        if (incTime && dt > 0) {
            time += dt * 0.00022 * getMultiplier();
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const angle = -0.39;
        const span = Math.max(width, height) * 1.45;
        const step = 4;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        for (let o = 0; o < drawOrder.length; o += 1) {
            const idx = drawOrder[o];
            const L = lines[idx];
            const baseSpacing = (2 * span) / lines.length;
            const v0 = -span + baseSpacing * (idx + 0.5) + L.vJitter * 0.35;
            const lineTwist = ((idx % 19) - 9) * 0.0048;

            ctx.save();
            ctx.rotate(lineTwist);

            ctx.beginPath();
            let first = true;
            for (let u = -span; u <= span; u += step) {
                const w =
                    L.a1 * Math.sin(u * L.k1 + time * L.w1 + L.p1) +
                    L.a2 * Math.sin(u * L.k2 * 1.27 + time * L.w2 * 0.9 + L.p2) +
                    L.a3 * Math.sin(u * L.k3 * 2.63 - time * L.w3 + L.p3);
                const chaos =
                    0.22 * L.a2 * Math.sin(u * 0.0028 + time * 0.33 + idx * 0.91 + L.p2) +
                    0.12 * L.a3 * Math.sin(u * 0.0019 - time * 0.21 + o * 1.17 + L.p3);
                const v = v0 + w + chaos;
                if (first) {
                    ctx.moveTo(u, v);
                    first = false;
                } else {
                    ctx.lineTo(u, v);
                }
            }
            ctx.strokeStyle = `rgba(255,255,255,${L.alpha})`;
            ctx.lineWidth = L.lw;
            ctx.lineJoin = "miter";
            ctx.lineCap = "butt";
            ctx.stroke();

            ctx.restore();
        }

        ctx.restore();
    }

    function loop(ts) {
        const dt = lastTs ? Math.min(50, ts - lastTs) : 16;
        lastTs = ts;
        render(true, dt);
        rafId = requestAnimationFrame(loop);
    }

    function stopLoop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
    }

    function syncSliderUi() {
        const range = document.getElementById("wave-speed-range");
        const label = document.getElementById("wave-speed-label");
        if (range) {
            range.value = String(speedValue);
        }
        if (label) {
            const caps = ["Очень медленно", "Медленно", "Умеренно", "Быстрее"];
            const i = Math.min(3, Math.floor((speedValue - 1) / 25.5));
            label.textContent = `${speedValue}% — ${caps[i]}`;
        }
    }

    function setSpeed(v) {
        const n = Math.max(1, Math.min(100, Math.round(Number(v))));
        speedValue = n;
        writeSpeed(n);
        syncSliderUi();
    }

    function bindSettings() {
        const range = document.getElementById("wave-speed-range");
        if (!range) {
            return;
        }
        syncSliderUi();
        range.addEventListener("input", () => {
            setSpeed(Number(range.value));
        });
    }

    function checkReducedMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function restartMotion() {
        stopLoop();
        reducedMotion = checkReducedMotion();
        lastTs = 0;
        if (reducedMotion) {
            render(false, 0);
        } else {
            rafId = requestAnimationFrame(loop);
        }
    }

    function init() {
        speedValue = readSpeed();
        reducedMotion = checkReducedMotion();
        ensureCanvas();
        resize();
        bindSettings();
        syncSliderUi();

        window.addEventListener("resize", () => {
            resize();
            if (reducedMotion) {
                render(false, 0);
            }
        });

        window.addEventListener("storage", (e) => {
            if (e.key !== STORAGE_KEY || e.newValue == null) {
                return;
            }
            const n = parseInt(e.newValue, 10);
            if (n >= 1 && n <= 100) {
                speedValue = n;
                syncSliderUi();
            }
        });

        const mqRm = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onRmChange = () => {
            restartMotion();
        };
        if (typeof mqRm.addEventListener === "function") {
            mqRm.addEventListener("change", onRmChange);
        } else if (typeof mqRm.addListener === "function") {
            mqRm.addListener(onRmChange);
        }

        restartMotion();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    window.knigiWave = {
        setSpeed,
        getSpeed: () => speedValue,
        redraw: () => {
            resize();
            if (reducedMotion) {
                render(false, 0);
            }
        }
    };
})();
