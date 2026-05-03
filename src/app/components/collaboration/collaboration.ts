import {
  Component,
  inject,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  ElementRef,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-collaboration',
  imports: [TranslateModule],
  templateUrl: './collaboration.html',
  styleUrl: './collaboration.scss',
})
export class CollaborationComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  sectionRef = viewChild<ElementRef>('sectionRef');

  /** All continuous tweens so we can kill them on destroy */
  private orbitTweens: gsap.core.Tween[] = [];

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnimations();
    }
  }

  ngOnDestroy(): void {
    this.orbitTweens.forEach(t => t.kill());
    this.orbitTweens = [];
  }

  private async initAnimations(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    const el = this.sectionRef()?.nativeElement;
    if (!el) return;

    // ── Section header timeline ──────────────────────────────────
    const headerTl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 80%' },
      defaults: { ease: 'power3.out' },
    });

    const badge = el.querySelector('.collab__badge');
    if (badge) {
      headerTl.fromTo(
        badge,
        { opacity: 0, y: rm ? 0 : 20, scale: rm ? 1 : 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: rm ? 0.01 : 0.5 }
      );
    }

    headerTl
      .fromTo(
        el.querySelector('.collab__title'),
        { opacity: 0, y: rm ? 0 : 30, filter: rm ? 'none' : 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: rm ? 0.01 : 0.8 },
        '-=0.2'
      )
      .fromTo(
        el.querySelector('.collab__desc'),
        { opacity: 0, y: rm ? 0 : 20 },
        { opacity: 1, y: 0, duration: rm ? 0.01 : 0.6 },
        '-=0.4'
      );

    const ctaBtn = el.querySelector('.collab__cta');
    if (ctaBtn) {
      headerTl.fromTo(
        ctaBtn,
        { opacity: 0, y: rm ? 0 : 20 },
        { opacity: 1, y: 0, duration: rm ? 0.01 : 0.5, clearProps: 'transform' },
        '-=0.3'
      );
      // Micro-interaction on the CTA button
      if (!rm) {
        this.anim.addButtonHover(ctaBtn as HTMLElement, 1.04);
      }
    }

    // ── Stats bar slide-up ───────────────────────────────────────
    const statsBar = el.querySelector('.collab__stats');
    if (statsBar) {
      gsap.fromTo(
        statsBar,
        { opacity: 0, y: rm ? 0 : 60, scale: rm ? 1 : 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: rm ? 0.01 : 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: statsBar, start: 'top 90%' },
        }
      );
    }

    // ── Counter animation — parse target from initial textContent ─
    const statValues = el.querySelectorAll('.collab__stat-value');
    statValues.forEach((stat: HTMLElement) => {
      const text = stat.textContent?.trim() || '';
      const numericMatch = text.match(/[\d.]+/);
      if (!numericMatch) return;

      const target = parseFloat(numericMatch[0]);
      const suffix = text.replace(numericMatch[0], '');
      const hasDecimal = text.includes('.');

      this.anim.counterUp(stat, target, suffix, hasDecimal, {
        trigger: stat,
        start: 'top 90%',
      });
    });

    // ── Avatar nodes scale-in ────────────────────────────────────
    const avatars = el.querySelectorAll('.collab__node');
    if (avatars.length) {
      gsap.fromTo(
        avatars,
        { opacity: 0, scale: rm ? 1 : 0 },
        {
          opacity: 1,
          scale: 1,
          stagger: rm ? 0 : { each: 0.08, from: 'center' },
          duration: rm ? 0.01 : 0.5,
          ease: rm ? 'none' : 'back.out(2)',
          scrollTrigger: {
            trigger: el.querySelector('.collab__orbit'),
            start: 'top 85%',
          },
          onComplete: () => {
            // Start orbit animations AFTER nodes are visible
            if (!rm) this.startOrbitAnimations(el, gsap);
          },
        }
      );
    } else if (!rm) {
      // No avatars found, start orbits directly
      this.startOrbitAnimations(el, gsap);
    }
  }

  /**
   * Continuous orbit animations — called after avatar scale-in completes.
   *
   * Strategy:
   *  - Each ring rotates at a different speed (inner fastest, outer slowest)
   *  - Ring 1 → CW (30s), Ring 2 → CCW (45s), Ring 3 → CW (60s)
   *  - Each node counter-rotates at the same speed as its parent ring
   *    so avatars remain upright while the ring turns beneath them
   *  - Avatar nodes get a gentle y float for organic feel
   */
  private startOrbitAnimations(el: HTMLElement, gsap: typeof import('gsap').gsap): void {
    const rings = [
      { selector: '.collab__ring--1', duration: 30,  direction: 1  },
      { selector: '.collab__ring--2', duration: 45,  direction: -1 },
      { selector: '.collab__ring--3', duration: 60,  direction: 1  },
    ];

    rings.forEach(({ selector, duration, direction }) => {
      const ring = el.querySelector(selector) as HTMLElement | null;
      if (!ring) return;

      // Ring rotation
      const ringTween = gsap.to(ring, {
        rotation: 360 * direction,
        duration,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%',
      });
      this.orbitTweens.push(ringTween);

      // Counter-rotate each node so avatars stay upright
      const nodes = ring.querySelectorAll('.collab__node');
      nodes.forEach((node: Element) => {
        const nodeTween = gsap.to(node, {
          rotation: -360 * direction,
          duration,
          repeat: -1,
          ease: 'none',
          transformOrigin: '50% 50%',
        });
        this.orbitTweens.push(nodeTween);
      });
    });

    // ── Gentle float on avatar nodes (y bob) ─────────────────────
    // Stagger offset so they don't all move together
    const avatarNodes = el.querySelectorAll('.collab__node--avatar');
    avatarNodes.forEach((node: Element, i: number) => {
      const floatTween = gsap.to(node, {
        y: i % 2 === 0 ? -7 : 7,
        duration: 2.5 + (i * 0.4),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3,
      });
      this.orbitTweens.push(floatTween);
    });

    // ── Dot nodes pulse opacity ───────────────────────────────────
    const dotNodes = el.querySelectorAll('.collab__node--dot');
    dotNodes.forEach((dot: Element, i: number) => {
      const dotTween = gsap.to(dot, {
        opacity: 0.3,
        scale: 0.6,
        duration: 1.5 + (i * 0.25),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.5,
      });
      this.orbitTweens.push(dotTween);
    });
  }
}
