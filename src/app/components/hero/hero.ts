import {
  Component,
  inject,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../services/animation.service';

/**
 * HeroComponent
 * 
 * Renders the main landing hero section.
 * Uses ResizeObserver to calculate dynamic SVG mask coordinates, enabling
 * pixel-perfect, responsive "pill" cutouts for the floating CTA buttons.
 * Integrates with AnimationService for staggered GSAP entrance choreographies.
 */
@Component({
  selector: 'app-hero',
  imports: [TranslateModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  heroSection = viewChild<ElementRef>('heroSection');
  private ro?: ResizeObserver;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnimations();
      this.initResizeObserver();
    }
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  private initResizeObserver(): void {
    const el = this.heroSection()?.nativeElement;
    if (!el) return;

    const svgEl = el.querySelector('.hero__image-svg') as SVGSVGElement;
    const ctaWrapper = el.querySelector('.hero__cta-wrapper') as HTMLElement;
    const lmWrapper = el.querySelector('.hero__learn-more-wrapper') as HTMLElement;
    const maskTl = el.querySelector('#mask-tl') as SVGRectElement | null;
    const maskBr = el.querySelector('#mask-br') as SVGRectElement | null;

    if (!svgEl || !window.ResizeObserver) return;

    // Angular strips SVG presentation attributes like `mask` during sanitization.
    // We must apply them imperatively via setAttribute AFTER the view renders.
    const imgGroup = el.querySelector('#hero-img-group');
    if (imgGroup) {
      imgGroup.setAttribute('mask', 'url(#hero-img-mask)');
      imgGroup.setAttribute('clip-path', 'url(#hero-outer-clip)');
    }

    // SVG viewBox is fixed at 960×540 (matches the image's natural ratio)
    const VB_W = 960;
    const VB_H = 540;
    // Gap around the button (in screen pixels) before scaling to SVG units.
    // Must match the padding on .hero__cta-wrapper / .hero__learn-more-wrapper (16px).
    const GAP_PX = 16;

    const update = () => {
      const svgRect = svgEl.getBoundingClientRect();
      if (svgRect.width === 0) return; // skip if not yet laid out

      // Scale factors: 1 CSS pixel = how many SVG user units
      const scaleX = VB_W / svgRect.width;
      const scaleY = VB_H / svgRect.height;
      const gapX = GAP_PX * scaleX;
      const gapY = GAP_PX * scaleY;

      // ─── Top-left pill cutout ──────────────────────────────
      if (ctaWrapper && maskTl) {
        const btn = ctaWrapper.querySelector('.hero__cta') as HTMLElement;
        if (btn) {
          const b = btn.getBoundingClientRect();
          const x = (b.left - svgRect.left) * scaleX - gapX;
          const y = (b.top - svgRect.top) * scaleY - gapY;
          const w = b.width * scaleX + gapX * 2;
          const h = b.height * scaleY + gapY * 2;
          maskTl.setAttribute('x', `${x}`);
          maskTl.setAttribute('y', `${y}`);
          maskTl.setAttribute('width', `${w}`);
          maskTl.setAttribute('height', `${h}`);
        }
      }

      // ─── Bottom-right pill cutout ──────────────────────────
      if (lmWrapper && maskBr) {
        const btn = lmWrapper.querySelector('.hero__learn-more') as HTMLElement;
        if (btn) {
          const b = btn.getBoundingClientRect();
          const x = (b.left - svgRect.left) * scaleX - gapX;
          const y = (b.top - svgRect.top) * scaleY - gapY;
          const w = b.width * scaleX + gapX * 2;
          const h = b.height * scaleY + gapY * 2;
          maskBr.setAttribute('x', `${x}`);
          maskBr.setAttribute('y', `${y}`);
          maskBr.setAttribute('width', `${w}`);
          maskBr.setAttribute('height', `${h}`);
        }
      }
    };

    this.ro = new ResizeObserver(update);
    this.ro.observe(svgEl);
    if (ctaWrapper) this.ro.observe(ctaWrapper);
    if (lmWrapper) this.ro.observe(lmWrapper);

    // Double-rAF ensures layout is fully stable before first calculation
    requestAnimationFrame(() => requestAnimationFrame(update));
  }

  private async initAnimations(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const ScrollTrigger = this.anim.ScrollTrigger;
    const rm = this.anim.prefersReducedMotion();

    const el = this.heroSection()?.nativeElement;
    if (!el) return;

    // ── Choreographed entrance timeline ──────────────────────────
    // CSS starts elements at opacity:0 (FOUC prevention in hero.scss)
    // Delay added to orchestrate with the Navbar slide-down sequence
    const tl = gsap.timeline({ 
      delay: 0.5,
      defaults: { ease: 'power4.out' } 
    });

    tl.fromTo(el.querySelector('.hero__badge'),
      { opacity: 0, y: rm ? 0 : 30, scale: rm ? 1 : 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: rm ? 0.01 : 0.8 }
    )
      .fromTo(el.querySelector('.hero__subtitle'),
        { opacity: 0, y: rm ? 0 : 20, filter: rm ? 'none' : 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: rm ? 0.01 : 0.8 },
        '-=0.6'
      )
      .fromTo(el.querySelector('.hero__title'),
        { opacity: 0, y: rm ? 0 : 40, filter: rm ? 'none' : 'blur(12px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: rm ? 0.01 : 1.2 },
        '-=0.6'
      )
      .fromTo(el.querySelector('.hero__desc'),
        { opacity: 0, y: rm ? 0 : 20, filter: rm ? 'none' : 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: rm ? 0.01 : 1 },
        '-=0.9'
      )
      .fromTo(el.querySelector('.hero__image-svg'),
        { opacity: 0, y: rm ? 0 : 80, scale: rm ? 1 : 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: rm ? 0.01 : 1.4, ease: 'power3.out' },
        '-=0.7'
      )
      .fromTo(el.querySelector('.hero__cta'),
        { opacity: 0, x: rm ? 0 : -40, scale: rm ? 1 : 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: rm ? 0.01 : 0.8, ease: 'back.out(1.2)', clearProps: 'transform' },
        '-=0.9'
      )
      .fromTo(el.querySelector('.hero__learn-more'),
        { opacity: 0, x: rm ? 0 : 40, scale: rm ? 1 : 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: rm ? 0.01 : 0.8, ease: 'back.out(1.2)', clearProps: 'transform' },
        '-=0.7'
      );

    // ── Button micro-interactions (after entrance completes) ──────
    if (!rm) {
      tl.add(() => {
        const ctaBtn = el.querySelector('.hero__cta') as HTMLElement | null;
        const lmBtn = el.querySelector('.hero__learn-more') as HTMLElement | null;
        if (ctaBtn) this.anim.addButtonHover(ctaBtn, 1.05);
        if (lmBtn) this.anim.addButtonHover(lmBtn, 1.04);
      });
    }

    // ── Continuous floating animation for background glows ────────
    if (!rm) {
      const glowCyan = el.querySelector('.hero__glow--cyan');
      if (glowCyan) {
        gsap.to(glowCyan, {
          y: -30, x: 20, rotation: -10,
          duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut',
        });
      }

      const glowPurple = el.querySelector('.hero__glow--purple');
      if (glowPurple) {
        gsap.to(glowPurple, {
          y: 40, x: -20, rotation: 20,
          duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut',
        });
      }

      // ── Subtle parallax float on scroll ────────────────────────
      const imageWrapper = el.querySelector('.hero__image-wrapper');
      if (imageWrapper) {
        gsap.to(imageWrapper, {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }
    }
  }
}
