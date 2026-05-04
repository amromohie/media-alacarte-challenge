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
import { PillMaskDirective } from '../../directives/pill-mask.directive';

/**
 * HeroComponent
 * 
 * Renders the main landing hero section.
 * Entrance animations are choreographed via AnimationService tokens.
 * Geometric SVG masking is handled by the PillMaskDirective.
 */
@Component({
  selector: 'app-hero',
  imports: [TranslateModule, PillMaskDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  
  heroSection = viewChild<ElementRef>('heroSection');
  badge = viewChild<ElementRef>('badge');
  subtitle = viewChild<ElementRef>('subtitle');
  title = viewChild<ElementRef>('title');
  description = viewChild<ElementRef>('description');
  heroImage = viewChild<ElementRef>('heroImage');
  imgGroup = viewChild<ElementRef>('imgGroup');
  imageWrapper = viewChild<ElementRef>('imageWrapper');
  ctaBtn = viewChild<ElementRef>('ctaBtn');
  learnMoreBtn = viewChild<ElementRef>('learnMoreBtn');
  glowCyan = viewChild<ElementRef>('glowCyan');
  glowPurple = viewChild<ElementRef>('glowPurple');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Defer animations slightly to prioritize initial paint and LCP
      setTimeout(() => {
        this.initAnimations();
        this.applySvgAttributes();
      }, 50);
    }
  }

  /**
   * Angular strips SVG presentation attributes like `mask` during sanitization.
   * We must apply them imperatively via setAttribute AFTER the view renders.
   */
  private applySvgAttributes(): void {
    const imgGroup = this.imgGroup()?.nativeElement;
    if (imgGroup) {
      imgGroup.setAttribute('mask', 'url(#hero-img-mask)');
      imgGroup.setAttribute('clip-path', 'url(#hero-outer-clip)');
    }
  }

  private async initAnimations(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    const el = this.heroSection()?.nativeElement;

    const els = {
      badge: this.badge()?.nativeElement,
      subtitle: this.subtitle()?.nativeElement,
      title: this.title()?.nativeElement,
      description: this.description()?.nativeElement,
      image: this.heroImage()?.nativeElement,
      cta: this.ctaBtn()?.nativeElement,
      learnMore: this.learnMoreBtn()?.nativeElement,
      glowCyan: this.glowCyan()?.nativeElement,
      glowPurple: this.glowPurple()?.nativeElement,
    };

    if (!els.badge) return;

    // ── Choreographed entrance timeline ──────────────────────────
    // CSS starts elements at opacity:0 (FOUC prevention in hero.scss)
    // Delay added to orchestrate with the Navbar slide-down sequence
    const tl = gsap.timeline({ 
      delay: 0.5,
      defaults: { ease: this.anim.EASES.ENTRANCE } 
    });

    tl.fromTo(els.badge,
      { opacity: 0, y: rm ? 0 : 30, scale: rm ? 1 : 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: rm ? 0.01 : this.anim.DURATIONS.ENTRANCE }
    )
      .fromTo(els.subtitle,
        { opacity: 0, y: rm ? 0 : 20, filter: rm ? 'none' : 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: rm ? 0.01 : this.anim.DURATIONS.ENTRANCE },
        '-=0.6'
      )
      .fromTo(els.title,
        { opacity: 0, y: rm ? 0 : 40, filter: rm ? 'none' : 'blur(12px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: rm ? 0.01 : this.anim.DURATIONS.SLOW },
        '-=0.6'
      )
      .fromTo(els.description,
        { opacity: 0, y: rm ? 0 : 20, filter: rm ? 'none' : 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: rm ? 0.01 : 1 },
        '-=0.9'
      )
      .fromTo(els.image,
        { opacity: 0, y: rm ? 0 : 80, scale: rm ? 1 : 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: rm ? 0.01 : 1.4, ease: this.anim.EASES.DECELERATE },
        '-=0.7'
      )
      .fromTo(els.cta,
        { opacity: 0, x: rm ? 0 : -40, scale: rm ? 1 : 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: rm ? 0.01 : this.anim.DURATIONS.ENTRANCE, ease: this.anim.EASES.POP, clearProps: 'transform' },
        '-=0.9'
      )
      .fromTo(els.learnMore,
        { opacity: 0, x: rm ? 0 : 40, scale: rm ? 1 : 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: rm ? 0.01 : this.anim.DURATIONS.ENTRANCE, ease: this.anim.EASES.POP, clearProps: 'transform' },
        '-=0.7'
      );

    // ── Button micro-interactions (after entrance completes) ──────
    if (!rm) {
      tl.add(() => {
        if (els.cta) this.anim.addButtonHover(els.cta, 1.05);
        if (els.learnMore) this.anim.addButtonHover(els.learnMore, 1.04);
      });
    }

    // ── Continuous floating animation for background glows ────────
    if (!rm) {
      if (els.glowCyan) {
        gsap.to(els.glowCyan, {
          y: -30, x: 20, rotation: -10,
          duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut',
        });
      }

      if (els.glowPurple) {
        gsap.to(els.glowPurple, {
          y: 40, x: -20, rotation: 20,
          duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut',
        });
      }

      // ── Subtle parallax float on scroll ────────────────────────
      const imageWrapper = this.imageWrapper()?.nativeElement;
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
