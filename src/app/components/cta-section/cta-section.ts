import { Component, inject, AfterViewInit, OnDestroy, PLATFORM_ID, ElementRef, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../services/animation.service';

/**
 * CtaSectionComponent
 * 
 * Renders the final Call To Action section.
 * Features scroll-triggered entrance animations and an ongoing pulse micro-interaction.
 * Uses OnPush change detection for optimized rendering performance.
 */
@Component({
  selector: 'app-cta-section',
  imports: [TranslateModule],
  templateUrl: './cta-section.html',
  styleUrl: './cta-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaSectionComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  sectionRef = viewChild<ElementRef>('sectionRef');

  /** Reference to the pulse tween so we can kill it on destroy */
  private pulseTween?: gsap.core.Tween | null;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimation();
    }
  }

  ngOnDestroy(): void {
    this.pulseTween?.kill();
  }

  private async initScrollAnimation(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    const el = this.sectionRef()?.nativeElement;
    if (!el) return;

    const btn = el.querySelector('.cta-section__btn') as HTMLElement | null;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 80%' },
      defaults: { ease: 'power3.out' },
    });

    // Card reveal
    tl.from(el.querySelector('.cta-section__card'), {
      opacity: 0,
      y: rm ? 0 : 50,
      scale: rm ? 1 : 0.97,
      duration: rm ? 0.01 : 0.8,
    });

    // Title
    tl.from(
      el.querySelector('.cta-section__title'),
      {
        opacity: 0,
        y: rm ? 0 : 20,
        filter: rm ? 'none' : 'blur(6px)',
        duration: rm ? 0.01 : 0.6,
      },
      '-=0.4'
    );

    // Check points stagger
    tl.from(
      el.querySelectorAll('.cta-section__point'),
      {
        opacity: 0,
        x: rm ? 0 : -20,
        stagger: rm ? 0 : 0.12,
        duration: rm ? 0.01 : 0.5,
      },
      '-=0.3'
    );

    // Button entrance with slight bounce
    tl.from(
      btn,
      {
        opacity: 0,
        y: rm ? 0 : 20,
        scale: rm ? 1 : 0.9,
        duration: rm ? 0.01 : 0.5,
        ease: 'back.out(1.6)',
        clearProps: 'transform',
        // After entrance: start continuous pulse attention loop
        onComplete: () => {
          if (btn && !rm) {
            this.pulseTween = this.anim.addPulse(btn);
          }
        },
      },
      '-=0.2'
    );

    // Micro-interaction: scale on hover (on top of the pulse)
    if (btn && !rm) {
      this.anim.addButtonHover(btn, 1.04);
    }
  }
}
