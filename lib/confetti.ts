import { palette } from "./palette";

const COLORS = palette.confetti;

type Piece = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    w: number;
    h: number;
    rot: number;
    vr: number;
    tilt: number;
    tiltSpeed: number;
    color: string;
    life: number;
    max: number;
};

export type BurstOptions = {
    count?: number;
    spread?: number;
    angle?: number;
    power?: number;
};

export type Confetti = {
    burst: (x: number, y: number, opts?: BurstOptions) => void;
    destroy: () => void;
};

export function createConfetti(canvas: HTMLCanvasElement): Confetti {
    const ctx = canvas.getContext("2d")!;
    const pieces: Piece[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let last = 0;

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const frame = (t: number) => {
        const dt = Math.min((t - last) / 1000, 0.033);
        last = t;
        const drag = Math.pow(0.35, dt);
        ctx.clearRect(0, 0, w, h);

        for (let i = pieces.length - 1; i >= 0; i--) {
            const p = pieces[i];
            p.life += dt;
            if (p.life >= p.max || p.y > h + 40) {
                pieces.splice(i, 1);
                continue;
            }
            p.vx *= drag;
            p.vy = p.vy * drag + 620 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rot += p.vr * dt;
            p.tilt += p.tiltSpeed * dt;

            ctx.save();
            ctx.globalAlpha = Math.min(1, (p.max - p.life) / 0.6);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.scale(1, Math.cos(p.tilt));
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        }

        if (pieces.length) {
            raf = requestAnimationFrame(frame);
        } else {
            running = false;
            ctx.clearRect(0, 0, w, h);
        }
    };

    return {
        burst(x, y, opts = {}) {
            const {
                count = 60,
                spread = Math.PI * 2,
                angle = -Math.PI / 2,
                power = 700,
            } = opts;
            for (let i = 0; i < count; i++) {
                const a = angle + (Math.random() - 0.5) * spread;
                const s = power * (0.35 + Math.random() * 0.65);
                pieces.push({
                    x,
                    y,
                    vx: Math.cos(a) * s,
                    vy: Math.sin(a) * s,
                    w: 5 + Math.random() * 6,
                    h: 3 + Math.random() * 4,
                    rot: Math.random() * Math.PI * 2,
                    vr: (Math.random() - 0.5) * 12,
                    tilt: Math.random() * Math.PI * 2,
                    tiltSpeed: 4 + Math.random() * 8,
                    color: COLORS[(Math.random() * COLORS.length) | 0],
                    life: 0,
                    max: 1.8 + Math.random() * 1.2,
                });
            }
            if (!running) {
                running = true;
                last = performance.now();
                raf = requestAnimationFrame(frame);
            }
        },
        destroy() {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            pieces.length = 0;
        },
    };
}