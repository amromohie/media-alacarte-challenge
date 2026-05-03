import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * AnimationService — Central GSAP orchestrator.
 *
 * Responsibilities:
 *  - One-time plugin registration (GSAP + ScrollTrigger)
 *  - prefers-reduced-motion detection
 *  - Reusable animation helpers (fadeUp, staggerFadeUp, hoverTilt, etc.)
 *
 * Usage pattern in components:
 *   private anim = inject(AnimationService);
 *   await this.anim.ready();
 *   const { gsap, ScrollTrigger } = this.anim;
 */
@Injectable({ providedIn: 'root' })
export class AnimationService {
  private platformId = inject(PLATFORM_ID);

  /** Resolved references to GSAP instances after ready() */
  gsap!: typeof import('gsap').gsap;
  ScrollTrigger!: typeof import('gsap/ScrollTrigger').ScrollTrigger;

  private _ready: Promise<void> | null = null;

  /**
   * Returns true if the user has requested reduced motion via OS/browser settings.
   * Components should check this and skip/simplify animations accordingly.
   */
  prefersReducedMotion(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Lazily loads and registers GSAP + ScrollTrigger once.
   * Safe to call from multiple components simultaneously.
   */
  async ready(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this._ready) return this._ready;

    this._ready = (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // Global GSAP defaults — subtle, premium pacing
      gsap.defaults({ ease: 'power2.out', duration: 0.7 });

      this.gsap = gsap;
      this.ScrollTrigger = ScrollTrigger;
    })();

    return this._ready;
  }

  // ─────────────────────────────────────────────────────
  //  REUSABLE HELPERS
  // ─────────────────────────────────────────────────────

  /**
   * Fade + translateY entrance for a single element.
   * Respects prefers-reduced-motion (opacity-only fallback).
   */
  fadeUp(
    el: Element | null,
    opts: {
      duration?: number;
      delay?: number;
      fromY?: number;
      fromBlur?: string;
      ease?: string;
      clearProps?: string;
    } = {}
  ): gsap.core.Tween | null {
    if (!el || !this.gsap) return null;
    const rm = this.prefersReducedMotion();

    return this.gsap.fromTo(
      el,
      {
        opacity: 0,
        y: rm ? 0 : (opts.fromY ?? 30),
        filter: rm ? 'none' : (opts.fromBlur ?? 'blur(0px)'),
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: rm ? 0.01 : (opts.duration ?? 0.7),
        delay: opts.delay ?? 0,
        ease: opts.ease ?? 'power2.out',
        clearProps: opts.clearProps ?? '',
      }
    );
  }

  /**
   * Staggered fade + translateY for a NodeList or array of elements.
   */
  staggerFadeUp(
    els: NodeListOf<Element> | Element[],
    opts: {
      duration?: number;
      stagger?: number;
      fromY?: number;
      ease?: string;
      clearProps?: string;
    } = {}
  ): gsap.core.Tween | null {
    if (!els || !this.gsap) return null;
    const rm = this.prefersReducedMotion();

    return this.gsap.fromTo(
      Array.from(els),
      { opacity: 0, y: rm ? 0 : (opts.fromY ?? 40), scale: rm ? 1 : 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: rm ? 0.01 : (opts.duration ?? 0.75),
        stagger: rm ? 0 : (opts.stagger ?? 0.12),
        ease: opts.ease ?? 'power2.out',
        clearProps: opts.clearProps ?? 'transform,opacity,filter',
      }
    );
  }

  /**
   * Animates a number counter on a DOM element.
   * Handles suffixes like "+", "M", "%" and decimal precision.
   *
   * @param el - The span element whose textContent will be updated
   * @param target - The final numeric value
   * @param suffix - Text appended after the number (e.g. "+", "M", "%")
   * @param hasDecimal - If true, uses toFixed(2) precision
   * @param scrollTriggerConfig - Optional ScrollTrigger config
   */
  counterUp(
    el: HTMLElement,
    target: number,
    suffix: string,
    hasDecimal: boolean,
    scrollTriggerConfig?: ScrollTrigger.Vars
  ): gsap.core.Tween | null {
    if (!this.gsap) return null;
    const rm = this.prefersReducedMotion();

    const obj = { val: rm ? target : 0 };
    if (rm) {
      el.textContent = (hasDecimal ? target.toFixed(2) : Math.floor(target).toString()) + suffix;
      return null;
    }

    return this.gsap.to(obj, {
      val: target,
      duration: 2.2,
      ease: 'power2.out',
      snap: hasDecimal ? { val: 0.01 } : { val: 1 },
      scrollTrigger: scrollTriggerConfig,
      onUpdate: () => {
        el.textContent =
          (hasDecimal ? obj.val.toFixed(2) : Math.floor(obj.val).toString()) + suffix;
      },
    });
  }

  /**
   * Adds a 3D tilt effect to a card element on mousemove.
   * Uses GPU-accelerated GSAP transforms (no filter).
   *
   * @param card - The card element to tilt
   * @param maxDeg - Maximum rotation in degrees (default 7)
   */
  addTiltHover(card: HTMLElement, maxDeg = 7): void {
    if (!this.gsap || this.prefersReducedMotion()) return;
    const gsap = this.gsap;

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = ((e.clientX - cx) / (rect.width / 2)) * maxDeg;
      const dy = ((e.clientY - cy) / (rect.height / 2)) * maxDeg;

      gsap.to(card, {
        rotateY: dx,
        rotateX: -dy,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });
  }

  /**
   * Adds a subtle lift + border-glow hover to an element via GSAP.
   * Complements (not replaces) existing CSS hover transitions.
   */
  addLiftHover(el: HTMLElement, liftY = -6): void {
    if (!this.gsap || this.prefersReducedMotion()) return;
    const gsap = this.gsap;

    el.addEventListener('mouseenter', () => {
      gsap.to(el, { y: liftY, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { y: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
    });
  }

  /**
   * Adds a micro-interaction to a button:
   *  - mouseenter: slight scale-up + brightness boost
   *  - mouseleave: revert
   */
  addButtonHover(btn: HTMLElement, scaleTo = 1.04): void {
    if (!this.gsap || this.prefersReducedMotion()) return;
    const gsap = this.gsap;

    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { scale: scaleTo, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
    });
    btn.addEventListener('mousedown', () => {
      gsap.to(btn, { scale: scaleTo * 0.97, duration: 0.1, ease: 'power2.in', overwrite: 'auto' });
    });
    btn.addEventListener('mouseup', () => {
      gsap.to(btn, { scale: scaleTo, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    });
  }

  /**
   * Adds a gentle looping pulse (scale + glow) to an element.
   * Designed for CTA buttons — non-distracting sine wave.
   *
   * @returns The GSAP tween so the caller can kill() it on destroy.
   */
  addPulse(el: HTMLElement, glowColor = 'rgba(255,51,102,0.5)'): gsap.core.Tween | null {
    if (!this.gsap || this.prefersReducedMotion()) return null;

    return this.gsap.to(el, {
      boxShadow: `0 0 40px ${glowColor}, 0 12px 32px ${glowColor.replace('0.5', '0.3')}`,
      scale: 1.025,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
}
