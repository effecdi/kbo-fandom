import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-triggered reveal animation for a container's children.
 * Each child fades in + slides up with stagger.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: {
    /** CSS selector for children to animate (default: "> *") */
    childSelector?: string;
    /** Y offset in px (default: 32) */
    y?: number;
    /** Duration per item (default: 0.7) */
    duration?: number;
    /** Stagger between items (default: 0.1) */
    stagger?: number;
    /** Scroll trigger start (default: "top 85%") */
    start?: string;
    /** Whether to replay on scroll back (default: false) */
    toggleActions?: string;
  },
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const {
      childSelector = "> *",
      y = 32,
      duration = 0.7,
      stagger = 0.1,
      start = "top 85%",
      toggleActions = "play none none none",
    } = options || {};

    const children = el.querySelectorAll(childSelector);
    if (children.length === 0) return;

    gsap.set(children, { opacity: 0, y });

    const tween = gsap.to(children, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [options?.childSelector, options?.y, options?.duration, options?.stagger, options?.start, options?.toggleActions]);

  return ref;
}

/**
 * Fade-in + slide-up for a single element on mount.
 */
export function useFadeIn<T extends HTMLElement = HTMLDivElement>(
  options?: {
    y?: number;
    duration?: number;
    delay?: number;
  },
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const { y = 24, duration = 0.8, delay = 0 } = options || {};

    gsap.fromTo(
      ref.current,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration, delay, ease: "power3.out" },
    );
  }, []);

  return ref;
}

/**
 * Counter animation — animates a number from 0 to target.
 */
export function useCountUp(
  target: number,
  options?: { duration?: number; delay?: number },
) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const { duration = 1.2, delay = 0.3 } = options || {};

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration,
      delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        toggleActions: "play none none none",
      },
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toLocaleString();
      },
    });
  }, [target]);

  return ref;
}

/**
 * Magnetic hover effect for buttons — subtle pull toward cursor.
 */
export function useMagneticHover<T extends HTMLElement = HTMLButtonElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: x * 0.15,
        y: y * 0.15,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return ref;
}
