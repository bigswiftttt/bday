"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Opening from "./Opening";
import Celebration from "./Celebration";
import MemoryLane from "./MemoryLane";
import Letter from "./Letter";

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
    const wrap = useRef<HTMLDivElement>(null);
    const rest = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const html = document.documentElement;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if ("scrollRestoration" in history) history.scrollRestoration = "manual";
        window.scrollTo(0, 0);

        // Lock scrolling while the opening plays; tapping shortens the wait.
        let timer = 0;
        const unlock = () => {
            html.style.overflow = "";
            ScrollTrigger.refresh();
        };
        const onTap = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(unlock, 2500);
        };
        if (!reduce) {
            html.style.overflow = "hidden";
            timer = window.setTimeout(unlock, 10000);
            wrap.current?.addEventListener("pointerdown", onTap);
        }

        const ctx = gsap.context(() => {
            if (reduce) return;
            // The opening shrinks and dims as the next section covers it.
            gsap.to(wrap.current, {
                scale: 0.94,
                opacity: 0.25,
                ease: "none",
                scrollTrigger: {
                    trigger: rest.current,
                    start: "top bottom",
                    end: "top top",
                    scrub: true,
                },
            });
        });

        document.fonts?.ready.then(() => ScrollTrigger.refresh());

        const wrapEl = wrap.current;
        return () => {
            window.clearTimeout(timer);
            wrapEl?.removeEventListener("pointerdown", onTap);
            html.style.overflow = "";
            ctx.revert();
        };
    }, []);

    return (
        <>
            <div ref={wrap} className="sticky top-0 z-0 h-svh">
                <Opening />
            </div>
            <div ref={rest} className="relative z-10 bg-ink">
                <Celebration />
                <MemoryLane />
                <Letter />
            </div>
        </>
    );
}