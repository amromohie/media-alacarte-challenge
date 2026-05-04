import { Component, ChangeDetectionStrategy, ElementRef, viewChild, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../services/animation.service';

/**
 * MarqueeBannerComponent
 * 
 * Displays an infinite scrolling marquee of logos/brands.
 * Powered by GSAP ScrollTrigger to scrub and change speed based on scroll velocity.
 * Uses OnPush change detection for optimized rendering performance.
 */
@Component({
  selector: 'app-marquee-banner',
  imports: [TranslateModule],
  templateUrl: './marquee-banner.html',
  styleUrl: './marquee-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarqueeBannerComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  
  track1 = viewChild<ElementRef>('track1');
  track2 = viewChild<ElementRef>('track2');

  private tweens: gsap.core.Tween[] = [];
  private scrollTrigger?: any;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initGsapMarquee();
    }
  }

  ngOnDestroy(): void {
    this.tweens.forEach(t => t.kill());
    this.scrollTrigger?.kill();
  }

  private async initGsapMarquee(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const ScrollTrigger = this.anim.ScrollTrigger;
    const rm = this.anim.prefersReducedMotion();

    const t1 = this.track1()?.nativeElement;
    const t2 = this.track2()?.nativeElement;
    if (!t1 || !t2 || rm) return; // Disable GSAP marquee if reduced motion is preferred

    // Determine direction based on document RTL
    const isRtl = document.documentElement.dir === 'rtl';
    const dirMulti = isRtl ? -1 : 1;

    // Track 1: Moves Left (or Right in RTL)
    const tween1 = gsap.to(t1, {
      xPercent: -50 * dirMulti,
      repeat: -1,
      duration: 35,
      ease: 'none',
    });

    // Track 2: Moves Right (or Left in RTL)
    const tween2 = gsap.fromTo(t2, 
      { xPercent: -50 * dirMulti },
      {
        xPercent: 0,
        repeat: -1,
        duration: 40,
        ease: 'none',
      }
    );

    this.tweens.push(tween1, tween2);

    // Add ScrollTrigger to scrub the timeScale based on scroll velocity
    this.scrollTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        // Calculate velocity. Scale it down to get a reasonable speed multiplier
        const velocity = Math.abs(self.getVelocity() / 300);
        // clamp velocity so it doesn't go absolutely crazy
        const speedScale = 1 + Math.min(velocity, 5); 
        
        gsap.to(this.tweens, { 
          timeScale: speedScale, 
          duration: this.anim.DURATIONS.QUICK, 
          overwrite: 'auto' 
        });
        
        // Return to normal speed after scrolling stops
        gsap.to(this.tweens, { 
          timeScale: 1, 
          duration: this.anim.DURATIONS.BASE, 
          delay: 0.1, 
          overwrite: 'auto' 
        });
      }
    });
  }
}
