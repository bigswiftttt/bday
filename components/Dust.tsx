"use client";

import { useEffect, useRef } from "react";
import { palette } from "../lib/palette";

type Mote = {
    x: number;
    y: number;
    r: number;
    a: number;
    speed: number;
    phase: number;
    sway: number;
};

export default function Dust() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current!;
        const ctx = canvas.getContext("2d")!;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let w = 0;
        let h = 0;
        let raf = 0;
        let last = performance.now();
        let motes: Mote[] = [];

        const make = (): Mote => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 0.5 + Math.random() * 1.4,
            a: 0.12 + Math.random() * 0.4,
            speed: 6 + Math.random() * 14,
            phase: Math.random() * Math.PI * 2,
            sway: 8 + Math.random() * 18,
        });

        const draw = (dt: number) => {
            ctx.clearRect(0, 0, w, h);
            for (const m of motes) {
                if (!reduce) {
                    m.y -= m.speed * dt;
                    m.phase += dt * 0.6;
                    if (m.y < -4) {
                        m.y = h + 4;
                        m.x = Math.random() * w;
                    }
                }
                const x = m.x + Math.sin(m.phase) * m.sway;
                const alpha = m.a * (0.6 + 0.4 * Math.sin(m.phase * 2.3));
                ctx.beginPath();
                ctx.fillStyle = `rgba(${palette.accentRgb},${alpha})`;
                ctx.arc(x, m.y, m.r, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            motes = Array.from({ length: w < 640 ? 34 : 70 }, make);
            if (reduce) draw(0);
        };

        const loop = (t: number) => {
            const dt = Math.min((t - last) / 1000, 0.05);
            last = t;
            draw(dt);
            raf = requestAnimationFrame(loop);
        };

        resize();
        window.addEventListener("resize", resize);
        if (!reduce) raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={ref}
            aria-hidden="true"
            className="dust pointer-events-none absolute inset-0 h-full w-full"
        />
    );
}