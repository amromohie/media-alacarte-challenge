import {
  Component,
  inject,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  ElementRef,
  viewChild,
  viewChildren,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-collaboration',
  imports: [TranslateModule],
  templateUrl: './collaboration.html',
  styleUrl: './collaboration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaborationComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);

  sectionRef = viewChild<ElementRef>('sectionRef');
  badgeRef = viewChild<ElementRef>('badgeRef');
  titleRef = viewChild<ElementRef>('titleRef');
  descRef = viewChild<ElementRef>('descRef');
  ctaRef = viewChild<ElementRef>('ctaRef');
  statsRef = viewChild<ElementRef>('statsRef');
  statValueRefs = viewChildren<ElementRef>('statValueRef');
  orbitRef = viewChild<ElementRef>('orbitRef');
  ringRefs = viewChildren<ElementRef>('ringRef');

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
    const badge = this.badgeRef()?.nativeElement;
    const title = this.titleRef()?.nativeElement;
    const desc = this.descRef()?.nativeElement;
    const cta = this.ctaRef()?.nativeElement;
    const stats = this.statsRef()?.nativeElement;

    if (!el) return;

    // ── Section header timeline ──────────────────────────────────
    const headerTl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 80%' },
      defaults: { ease: this.anim.EASES.DECELERATE },
    });

    if (badge) {
      headerTl.fromTo(
        badge,
        { opacity: 0, y: rm ? 0 : 20, scale: rm ? 1 : 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: rm ? 0.01 : 0.5 }
      );
    }

    if (title) {
      headerTl.fromTo(
        title,
        { opacity: 0, y: rm ? 0 : 30, filter: rm ? 'none' : 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: rm ? 0.01 : this.anim.DURATIONS.BASE },
        '-=0.2'
      );
    }

    if (desc) {
      headerTl.fromTo(
        desc,
        { opacity: 0, y: rm ? 0 : 20 },
        { opacity: 1, y: 0, duration: rm ? 0.01 : 0.6 },
        '-=0.4'
      );
    }

    if (cta) {
      headerTl.fromTo(
        cta,
        { opacity: 0, y: rm ? 0 : 20 },
        { opacity: 1, y: 0, duration: rm ? 0.01 : 0.5, clearProps: 'transform' },
        '-=0.3'
      );
      if (!rm) {
        this.anim.addButtonHover(cta, 1.04);
      }
    }

    // ── Stats bar slide-up ───────────────────────────────────────
    if (stats) {
      gsap.fromTo(
        stats,
        { opacity: 0, y: rm ? 0 : 60, scale: rm ? 1 : 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: rm ? 0.01 : this.anim.DURATIONS.ENTRANCE,
          ease: this.anim.EASES.SMOOTH,
          scrollTrigger: { trigger: stats, start: 'top 90%' },
        }
      );
    }

    // ── Counter animation ────────────────────────────────────────
    this.statValueRefs().forEach((statRef) => {
      const stat = statRef.nativeElement;
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
    const orbit = this.orbitRef()?.nativeElement;
    const nodes = orbit?.querySelectorAll('.collab__node');
    if (nodes?.length) {
      gsap.fromTo(
        nodes,
        { opacity: 0, scale: rm ? 1 : 0 },
        {
          opacity: 1,
          scale: 1,
          stagger: rm ? 0 : { each: 0.08, from: 'center' },
          duration: rm ? 0.01 : 0.5,
          ease: rm ? 'none' : this.anim.EASES.BOUNCE,
          scrollTrigger: {
            trigger: orbit,
            start: 'top 85%',
          },
          onComplete: () => {
            if (!rm) this.startOrbitAnimations(gsap);
          },
        }
      );
    } else if (!rm) {
      this.startOrbitAnimations(gsap);
    }
  }

  private startOrbitAnimations(gsap: typeof import('gsap').gsap): void {
    const ringDurations = [30, 45, 60];
    const ringDirections = [1, -1, 1];

    this.ringRefs().forEach((ringRef, i) => {
      const ring = ringRef.nativeElement;
      const duration = ringDurations[i] || 30;
      const direction = ringDirections[i] || 1;

      // Ring rotation
      const ringTween = gsap.to(ring, {
        rotation: 360 * direction,
        duration,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%',
      });
      this.orbitTweens.push(ringTween);

      // Counter-rotate each node
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

    // Gentle float on avatar nodes
    const orbit = this.orbitRef()?.nativeElement;
    const avatarNodes = orbit?.querySelectorAll('.collab__node--avatar');
    avatarNodes?.forEach((node: Element, i: number) => {
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

    // Dot nodes pulse opacity
    const dotNodes = orbit?.querySelectorAll('.collab__node--dot');
    dotNodes?.forEach((dot: Element, i: number) => {
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

