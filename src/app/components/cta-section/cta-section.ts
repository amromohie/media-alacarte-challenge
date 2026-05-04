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
  cardRef = viewChild<ElementRef>('cardRef');
  titleRef = viewChild<ElementRef>('titleRef');
  pointRefs = viewChildren<ElementRef>('pointRef');
  btnRef = viewChild<ElementRef>('btnRef');

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
    const card = this.cardRef()?.nativeElement;
    const title = this.titleRef()?.nativeElement;
    const points = this.pointRefs().map(p => p.nativeElement);
    const btn = this.btnRef()?.nativeElement;

    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 80%' },
      defaults: { ease: this.anim.EASES.DECELERATE },
    });

    // Card reveal
    if (card) {
      tl.from(card, {
        opacity: 0,
        y: rm ? 0 : 50,
        scale: rm ? 1 : 0.97,
        duration: rm ? 0.01 : this.anim.DURATIONS.ENTRANCE,
      });
    }

    // Title
    if (title) {
      tl.from(
        title,
        {
          opacity: 0,
          y: rm ? 0 : 20,
          filter: rm ? 'none' : 'blur(6px)',
          duration: rm ? 0.01 : 0.6,
        },
        '-=0.4'
      );
    }

    // Check points stagger
    if (points.length) {
      tl.from(
        points,
        {
          opacity: 0,
          x: rm ? 0 : -20,
          stagger: rm ? 0 : 0.12,
          duration: rm ? 0.01 : 0.5,
        },
        '-=0.3'
      );
    }

    // Button entrance with slight bounce
    if (btn) {
      tl.from(
        btn,
        {
          opacity: 0,
          y: rm ? 0 : 20,
          scale: rm ? 1 : 0.9,
          duration: rm ? 0.01 : 0.5,
          ease: this.anim.EASES.POP,
          clearProps: 'transform',
          // After entrance: start continuous pulse attention loop
          onComplete: () => {
            if (!rm) {
              this.pulseTween = this.anim.addPulse(btn);
            }
          },
        },
        '-=0.2'
      );

      // Micro-interaction: scale on hover (on top of the pulse)
      if (!rm) {
        this.anim.addButtonHover(btn, 1.04);
      }
    }
  }
}
