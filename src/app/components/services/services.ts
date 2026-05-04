import { Component, inject, AfterViewInit, PLATFORM_ID, ElementRef, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../services/animation.service';

/**
 * ServicesComponent
 * 
 * Displays the core offerings/services in a grid.
 * Features 3D tilt hover effects and scroll-triggered GSAP entrance animations.
 * Uses OnPush change detection for optimized rendering performance.
 */
@Component({
  selector: 'app-services',
  imports: [TranslateModule],
  templateUrl: './services.html',
  styleUrl: './services.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  sectionRef = viewChild<ElementRef>('sectionRef');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimation();
      this.initCardInteractions();
    }
  }

  /**
   * CSS class toggle for overlay visibility (unchanged).
   * GSAP tilt is handled separately in initCardInteractions().
   */
  private initCardHoverClass(): void {
    const el = this.sectionRef()?.nativeElement;
    if (!el) return;

    el.querySelectorAll('.services__card--tall').forEach((card: HTMLElement) => {
      card.addEventListener('mouseenter', () => card.classList.add('is-hovered'));
      card.addEventListener('mouseleave', () => card.classList.remove('is-hovered'));
    });
  }

  /** 3D tilt + lift hover on all cards, CSS class toggle on tall cards. */
  private async initCardInteractions(): Promise<void> {
    await this.anim.ready();
    const rm = this.anim.prefersReducedMotion();

    const el = this.sectionRef()?.nativeElement;
    if (!el) return;

    // CSS class toggle for tall-card overlays (always needed for CSS transitions)
    this.initCardHoverClass();

    if (rm) return; // skip GSAP hover in reduced-motion mode

    // 3D tilt on ALL cards — max 6° so it stays subtle
    const gsap = this.anim.gsap;
    el.querySelectorAll('.services__card').forEach((card: HTMLElement) => {
      this.anim.addTiltHover(card, 6);

      // Arrow nudge on hover
      const arrow = card.querySelector('.services__card-arrow') as HTMLElement | null;
      if (arrow) {
        card.addEventListener('mouseenter', () => {
          gsap.to(arrow, { x: 4, y: -4, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(arrow, { x: 0, y: 0, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
        });
      }
    });
  }

  private async initScrollAnimation(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const ScrollTrigger = this.anim.ScrollTrigger;
    const rm = this.anim.prefersReducedMotion();

    const el = this.sectionRef()?.nativeElement;
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 80%' },
      defaults: { ease: 'power3.out' },
    });

    // Section icon + title entrance
    tl.from(el.querySelector('.services__icon'), {
      opacity: 0,
      scale: rm ? 1 : 0,
      duration: rm ? 0.01 : 0.5,
      ease: rm ? 'none' : 'back.out(2)',
    }).from(
      el.querySelector('.services__title'),
      {
        opacity: 0,
        y: rm ? 0 : 30,
        filter: rm ? 'none' : 'blur(6px)',
        duration: rm ? 0.01 : 0.7,
      },
      '-=0.2'
    );

    // Cards stagger — clearProps restores CSS :hover transitions
    tl.from(
      el.querySelectorAll('.services__card'),
      {
        opacity: 0,
        y: rm ? 0 : 50,
        scale: rm ? 1 : 0.95,
        stagger: rm ? 0 : 0.15,
        duration: rm ? 0.01 : 0.8,
        ease: 'power2.out',
        clearProps: 'opacity,transform,filter',
      },
      '-=0.3'
    );
  }
}
