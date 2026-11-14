"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import Dust from "./Dust";
import Balloon from "./Balloon";
import { createConfetti } from "../lib/confetti";
import { palette } from "../lib/palette";

// ---- Edit these ----
const NAME_LINES = ["GLAMOROUS", "THREAD"];
const MESSAGE =
    "Big Zee, the cape gets the day off. Everyone else can save the world.";
// --------------------

const B = palette.balloons;
const BALLOONS = [
    { left: "3%", top: "56%", w: "clamp(60px,9vw,120px)", color: B.rose, pop: true, front: true },
    { left: "86%", top: "50%", w: "clamp(56px,8vw,108px)", color: B.plum, pop: true, front: true },
    { left: "10%", top: "9%", w: "clamp(38px,5vw,64px)", color: B.deep, pop: false, front: false },
    { left: "80%", top: "8%", w: "clamp(64px,9.5vw,128px)", color: B.blush, pop: true, front: true },
    { left: "88%", top: "76%", w: "clamp(34px,4.5vw,58px)", color: B.plum, pop: false, front: false },
];

function Letters({ text, className }: { text: string; className: string }) {
    return (
        <span aria-hidden="true" className="inline-flex">
            {text.split("").map((ch, i) =>
                ch === " " ? (
                    <span key={i} className="inline-block w-[0.6em]" />
                ) : (
                    <span key={i} className={`${className} inline-block will-change-transform`}>
                        {ch}
                    </span>
                )
            )}
        </span>
    );
}

type DropOpts = {
    fall: number;
    rot: number;
    dur: number;
    squash: number;
    onLand?: () => void;
};

// One letter: weighted fall, impact squash, spring settle.
function drop(el: Element, o: DropOpts) {
    const tl = gsap.timeline();
    tl.fromTo(
        el,
        {
            y: -o.fall,
            rotationX: -65,
            rotationZ: o.rot,
            transformPerspective: 900,
            transformOrigin: "50% 100%",
        },
        { y: 0, rotationX: 0, rotationZ: 0, duration: o.dur, ease: "power3.in" },
        0
    )
        .to(el, { opacity: 1, duration: 0.12, ease: "none" }, 0)
        .call(() => o.onLand?.(), [], o.dur)
        .to(
            el,
            { scaleY: 1 - o.squash, scaleX: 1 + o.squash * 0.6, duration: 0.07, ease: "power2.out" },
            o.dur
        )
        .to(
            el,
            { scaleX: 1, scaleY: 1, duration: 0.65, ease: "elastic.out(1, 0.45)" },
            o.dur + 0.07
        );
    return tl;
}

export default function Opening() {
    const root = useRef<HTMLElement>(null);
    const confettiCanvas = useRef<HTMLCanvasElement>(null);

    useLayoutEffect(() => {
        const el = root.current!;
        const confetti = createConfetti(confettiCanvas.current!);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const q = gsap.utils.selector(el);
        let master: gsap.core.Timeline | undefined;

        const ctx = gsap.context(() => {
            // Reduced motion: show the finished composition, no movement.
            if (reduce) {
                gsap.set(q(".ko, .balloon-pop, .pulse"), { opacity: 0 });
                gsap.set(el, { opacity: 1 });
                return;
            }

            const h = window.innerHeight;
            const small = window.innerWidth < 640;
            const hb = q(".hb-letter");
            const sm = q(".sm-letter");
            const nm = q(".nm-letter");
            const balloons = q(".balloon");
            const pops = q(".balloon-pop");
            const cam = q(".cam");
            const nameBlock = q(".name-block");
            const msg = q(".msg");
            const cue = q(".cue");

            // Hidden start states (set before the first paint).
            gsap.set(
                q(".hb-letter, .sm-letter, .nm-letter, .msg, .cue, .ko, .glow, .dust, .pulse, .bloom"),
                { opacity: 0 }
            );
            gsap.set(q(".ko"), { rotation: -9 });
            gsap.set(q(".rule"), { scaleX: 0 });

            const tl = gsap.timeline();
            master = tl;

            // SCENE 1: anticipation
            tl.to(q(".dust, .glow"), { opacity: 1, duration: 2.4, ease: "sine.inOut" }, 0);
            tl.fromTo(cam, { scale: 1 }, { scale: 1.05, duration: 16, ease: "sine.inOut" }, 0);
            balloons.forEach((b, i) => {
                tl.fromTo(
                    b,
                    { y: h * 1.35 },
                    { y: 0, duration: 3.2 + (i % 3) * 0.3, ease: "power2.out" },
                    0.3 + i * 0.22
                );
            });
            q(".balloon-sway").forEach((s, i) => {
                gsap.fromTo(
                    s,
                    { rotation: -3.5, y: -4, transformOrigin: "50% 100%" },
                    { rotation: 3.5, y: 5, duration: 2.4 + i * 0.35, ease: "sine.inOut", yoyo: true, repeat: -1 }
                );
            });

            // SCENE 2: HAPPY BIRTHDAY drops in
            const T_HB = 1.8;
            hb.forEach((l, i) => {
                tl.add(
                    drop(l, {
                        fall: 280,
                        rot: gsap.utils.random(-18, 18),
                        dur: gsap.utils.random(0.55, 0.75),
                        squash: 0.04,
                    }),
                    T_HB + i * 0.055
                );
            });

            // SCENE 3a: SUPERMOM knocks in
            const T_SM = T_HB + 1.9;
            tl.fromTo(
                sm,
                { scale: 3.2, y: -30, rotation: () => gsap.utils.random(-12, 12) },
                { scale: 1, y: 0, rotation: 0, duration: 0.3, ease: "power4.in", stagger: 0.03 },
                T_SM
            );
            tl.to(sm, { opacity: 1, duration: 0.08, ease: "none", stagger: 0.03 }, T_SM);

            const T_KO = T_SM + 0.5;
            tl.addLabel("ko", T_KO);
            tl.to(sm, { scaleY: 0.92, scaleX: 1.04, duration: 0.06, ease: "power2.out" }, "ko");
            tl.to(sm, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.35)" }, "ko+=0.06");

            // KO: flash, shake, stamp, balloons pop
            tl.fromTo(
                q(".flash"),
                { opacity: 0 },
                { opacity: 0.85, duration: 0.04, ease: "none" },
                "ko"
            );
            tl.to(q(".flash"), { opacity: 0, duration: 0.45, ease: "power2.out" }, "ko+=0.04");

            const a = small ? 0.55 : 1;
            tl.to(
                cam,
                {
                    keyframes: [
                        { x: -16 * a, y: 8 * a, rotation: -0.6, duration: 0.045 },
                        { x: 14 * a, y: -9 * a, rotation: 0.5, duration: 0.045 },
                        { x: -10 * a, y: 6 * a, rotation: -0.35, duration: 0.045 },
                        { x: 7 * a, y: -4 * a, rotation: 0.2, duration: 0.045 },
                        { x: -3 * a, y: 2 * a, rotation: 0, duration: 0.05 },
                        { x: 0, y: 0, duration: 0.06 },
                    ],
                    ease: "none",
                    easeEach: "power1.out",
                },
                "ko"
            );

            tl.fromTo(
                q(".ko"),
                { scale: 2.4, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.18, ease: "power4.out" },
                "ko+=0.02"
            );
            tl.to(q(".ko"), { opacity: 0, y: -8, duration: 0.5, ease: "power2.in" }, "ko+=1.6");

            pops.forEach((p, i) => {
                const at = 0.03 + i * 0.06;
                tl.to(p, { scale: 1.45, opacity: 0, duration: 0.14, ease: "power2.out" }, `ko+=${at}`);
                tl.call(
                    () => {
                        const r = p.getBoundingClientRect();
                        confetti.burst(r.left + r.width / 2, r.top + r.height * 0.29, {
                            count: 14,
                            power: 380,
                        });
                    },
                    [],
                    `ko+=${at}`
                );
            });

            // SCENE 3b: THE NAME
            const T_NAME = T_KO + 0.95;
            let landEnd = T_NAME;
            const nudge = () =>
                gsap.fromTo(
                    nameBlock,
                    { y: 6 },
                    { y: 0, duration: 0.4, ease: "elastic.out(1, 0.5)", overwrite: "auto" }
                );
            nm.forEach((l, i) => {
                const start = T_NAME + i * 0.115 + gsap.utils.random(-0.02, 0.04);
                const dur = gsap.utils.random(0.5, 0.68);
                landEnd = Math.max(landEnd, start + dur);
                tl.add(
                    drop(l, {
                        fall: h * 0.8 + gsap.utils.random(0, 160),
                        rot: gsap.utils.random(-26, 26),
                        dur,
                        squash: 0.09,
                        onLand: nudge,
                    }),
                    start
                );
            });

            // Assembly complete: light wave, breath, bloom, ring, confetti
            const T_DONE = landEnd + 0.15;
            tl.to(
                nm,
                {
                    color: palette.accent,
                    duration: 0.22,
                    ease: "sine.out",
                    yoyo: true,
                    repeat: 1,
                    stagger: 0.045,
                },
                T_DONE
            );
            tl.to(
                nameBlock,
                { scale: 1.025, duration: 0.5, ease: "power2.out", yoyo: true, repeat: 1 },
                T_DONE
            );
            tl.fromTo(
                q(".bloom"),
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1.1, duration: 1.6, ease: "power2.out" },
                T_DONE
            );
            tl.fromTo(
                q(".pulse"),
                { scale: 0.4, opacity: 0.5 },
                { scale: 2.2, opacity: 0, duration: 1.4, ease: "power3.out" },
                T_DONE
            );
            tl.call(
                () => {
                    const r = nameBlock[0].getBoundingClientRect();
                    confetti.burst(r.left + r.width / 2, r.top + r.height * 0.35, {
                        count: small ? 55 : 90,
                        power: small ? 650 : 900,
                        spread: Math.PI * 1.6,
                    });
                },
                [],
                T_DONE
            );

            // SCENE 4: rule, message, cue
            tl.to(q(".rule"), { scaleX: 1, duration: 1.1, ease: "expo.out" }, T_DONE + 0.35);
            tl.fromTo(
                msg,
                { y: 18, opacity: 0, filter: "blur(6px)" },
                {
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: 1.2,
                    ease: "power3.out",
                    onComplete: () => {
                        gsap.set(msg, { clearProps: "filter" });
                    },
                },
                T_DONE + 0.9
            );
            tl.fromTo(
                cue,
                { y: 8, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
                T_DONE + 2.1
            );
            gsap.fromTo(
                q(".cue-line"),
                { scaleY: 0, transformOrigin: "top" },
                { scaleY: 1, duration: 1.4, ease: "power2.inOut", yoyo: true, repeat: -1 }
            );

            gsap.set(el, { opacity: 1 });
        }, el);

        // Tap/click anywhere to speed the sequence up. Dev only: press R to replay.
        const onTap = () => master?.timeScale(4);
        const onKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "r") master?.timeScale(1).restart();
        };
        el.addEventListener("pointerdown", onTap);
        if (process.env.NODE_ENV !== "production") {
            window.addEventListener("keydown", onKey);
        }

        return () => {
            el.removeEventListener("pointerdown", onTap);
            window.removeEventListener("keydown", onKey);
            ctx.revert();
            confetti.destroy();
        };
    }, []);

    return (
        <main ref={root} className="relative h-svh w-full overflow-hidden bg-ink opacity-0">
            <Dust />
            <div className="glow pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_50%_45%,rgba(216,164,143,0.10),transparent_62%)]" />
            <canvas
                ref={confettiCanvas}
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-10 h-full w-full"
            />

            <div className="cam absolute inset-0 z-20">
                <div
                    aria-hidden="true"
                    className="bloom pointer-events-none absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full [background:radial-gradient(circle,rgba(216,164,143,0.20),transparent_65%)]"
                />
                <div
                    aria-hidden="true"
                    className="pulse pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent"
                />

                <div className="pointer-events-none absolute inset-0">
                    {BALLOONS.map((b, i) => (
                        <div
                            key={i}
                            className={`balloon absolute ${b.pop ? "balloon-pop" : ""}`}
                            style={{ left: b.left, top: b.top, width: b.w }}
                        >
                            <div
                                className="balloon-sway"
                                style={b.front ? undefined : { filter: "blur(1.5px)", opacity: 0.6 }}
                            >
                                <Balloon color={b.color} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
                    <h1
                        aria-label="Happy birthday, Supermom. Glamorous Thread."
                        className="flex flex-col items-center"
                    >
                        <span className="flex font-display text-[clamp(0.9rem,3.4vw,1.9rem)] tracking-[0.32em] text-ivory/90">
                            <Letters text="HAPPY BIRTHDAY" className="hb-letter" />
                        </span>

                        <span className="relative mt-[2.2vh] inline-block font-display text-[clamp(1.7rem,8vw,4.8rem)] italic tracking-[0.1em] text-accent">
                            <Letters text="SUPERMOM" className="sm-letter" />
                            <span
                                aria-hidden="true"
                                className="ko absolute -right-3 -top-3 border border-accent px-2 py-0.5 text-[clamp(0.6rem,1.5vw,0.85rem)] font-normal not-italic tracking-[0.3em] text-accent"
                            >
                                K.O.
                            </span>
                        </span>

                        <span className="name-block mt-[1.6vh] flex flex-col items-center font-display text-[clamp(2.6rem,12.4vw,10.5rem)] leading-[0.9] tracking-tight text-ivory">
                            {NAME_LINES.map((line) => (
                                <span key={line} className="block whitespace-nowrap">
                                    <Letters text={line} className="nm-letter" />
                                </span>
                            ))}
                        </span>
                    </h1>

                    <span
                        aria-hidden="true"
                        className="rule mt-[2.6vh] block h-px w-[min(56vw,20rem)] bg-accent/80"
                    />

                    <p className="msg mt-[2.4vh] max-w-[30ch] text-balance text-[clamp(0.85rem,2.2vw,1.15rem)] font-light leading-relaxed text-ivory/75">
                        {MESSAGE}
                    </p>
                </div>

                <div
                    aria-hidden="true"
                    className="cue absolute inset-x-0 bottom-[calc(2.2rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-3 text-[0.65rem] uppercase tracking-[0.5em] text-accent"
                >
                    <span>Scroll</span>
                    <span className="cue-line block h-10 w-px bg-accent/70" />
                </div>
            </div>

            <div className="grain pointer-events-none fixed inset-0 z-30" aria-hidden="true" />
            <div className="vignette pointer-events-none fixed inset-0 z-30" aria-hidden="true" />
            <div className="flash pointer-events-none fixed inset-0 z-40 bg-ivory opacity-0" />
        </main>
    );
}