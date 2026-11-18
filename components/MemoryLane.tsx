"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PHOTOS, type Era } from "../lib/photos";

gsap.registerPlugin(ScrollTrigger);

// ---- Edit these ----
const LANE_LABEL = "Memory lane";
const LANE_LINE = "From then, to now.";
const LANE_END = "And so many more.";
// --------------------

const FILTER: Record<Era, string> = {
    then: "sepia(0.35) contrast(1.05) saturate(0.9)",
    between: "sepia(0.12) contrast(1.02)",
    now: "none",
};
const GRAIN: Record<Era, number> = { then: 0.2, between: 0.08, now: 0 };
const TILT = [-1.2, 1, -0.6, 1.4];

export default function MemoryLane() {
    const root = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const el = root.current!;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const q = gsap.utils.selector(el);

        const ctx = gsap.context(() => {
            const track = q(".lane-track")[0] as HTMLElement;

            // Reduced motion: no pinning, the strip scrolls sideways by hand.
            if (reduce) {
                gsap.set(el, { overflowX: "auto" });
                gsap.set(track, { position: "relative" });
                gsap.set(q(".lane-bar"), { display: "none" });
                return;
            }

            const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
            gsap.set(q(".lane-progress"), { scaleX: 0 });

            const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    trigger: el,
                    start: "top top",
                    end: () => `+=${dist() * 1.1}`,
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });
            tl.to(track, { x: () => -dist() }, 0);
            tl.to(q(".lane-progress"), { scaleX: 1 }, 0);
        }, el);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={root} className="lane relative h-svh w-full overflow-hidden">
            <div className="vignette pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="grain pointer-events-none absolute inset-0 z-20" aria-hidden="true" />

            <div className="lane-track absolute left-0 top-0 flex h-full items-center gap-[clamp(2.5rem,7vw,7rem)] px-[clamp(1.5rem,10vw,10rem)] will-change-transform">
                <div className="w-[min(78vw,30rem)] shrink-0">
                    <p className="text-xs uppercase tracking-[0.5em] text-accent">{LANE_LABEL}</p>
                    <p className="mt-6 font-display text-[clamp(2.4rem,8vw,5.5rem)] italic leading-[1.02] text-ivory">
                        {LANE_LINE}
                    </p>
                </div>

                {PHOTOS.map((p, i) => (
                    <figure
                        key={p.src}
                        className={`shrink-0 ${i % 2 ? "translate-y-[5svh]" : "-translate-y-[4svh]"}`}
                        style={{ rotate: `${TILT[i % TILT.length]}deg` }}
                    >
                        <div
                            className="relative overflow-hidden rounded-[2px] shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
                            style={{ height: "min(58svh,32rem)", aspectRatio: `${p.w} / ${p.h}` }}
                        >
                            <Image
                                src={p.src}
                                alt={p.caption ?? `Memory ${i + 1}`}
                                fill
                                sizes="(max-width: 640px) 70vw, 28rem"
                                className="object-cover"
                                style={{ filter: FILTER[p.era] }}
                                draggable={false}
                            />
                            <span
                                aria-hidden="true"
                                className="grain pointer-events-none absolute inset-0"
                                style={{ opacity: GRAIN[p.era] }}
                            />
                        </div>

                        {(p.year || p.caption) && (
                            <figcaption className="mt-5 max-w-[18rem]">
                                {p.year && (
                                    <span className="block text-[0.65rem] uppercase tracking-[0.4em] text-accent">
                                        {p.year}
                                    </span>
                                )}
                                {p.caption && (
                                    <span className="mt-2 block font-display text-[clamp(1rem,2.4vw,1.35rem)] italic leading-snug text-ivory/85">
                                        {p.caption}
                                    </span>
                                )}
                            </figcaption>
                        )}
                    </figure>
                ))}

                <div className="w-[min(78vw,26rem)] shrink-0 pr-[10vw]">
                    <p className="font-display text-[clamp(2rem,6vw,4rem)] italic leading-[1.05] text-accent">
                        {LANE_END}
                    </p>
                </div>
            </div>

            <div
                aria-hidden="true"
                className="lane-bar absolute inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] mx-auto h-px w-[min(60vw,24rem)] bg-ivory/15"
            >
                <div className="lane-progress h-full origin-left bg-accent" />
            </div>
        </section>
    );
}