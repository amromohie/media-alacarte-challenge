import { Component, inject, AfterViewInit, PLATFORM_ID, ElementRef, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-solutions',
  imports: [TranslateModule],
  templateUrl: './solutions.html',
  styleUrl: './solutions.scss',
})
export class SolutionsComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  sectionRef = viewChild<ElementRef>('sectionRef');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimation();
      this.initCardHover();
    }
  }

  /** Arrow slide + lift hover on feature cards. */
  private async initCardHover(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    const el = this.sectionRef()?.nativeElement;
    if (!el || rm) return;

    // Lift hover on all solution cards
    el.querySelectorAll('.solutions__card').forEach((card: HTMLElement) => {
      this.anim.addLiftHover(card, -5);
    });

    // Arrow nudge on feature cards (not the image card)
    el.querySelectorAll('.solutions__card:not(.solutions__card--image)').forEach(
      (card: HTMLElement) => {
        const arrow = card.querySelector('.solutions__card-arrow') as HTMLElement | null;
        if (!arrow) return;

        card.addEventListener('mouseenter', () => {
          gsap.to(arrow, { x: 3, y: -3, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(arrow, { x: 0, y: 0, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
        });
      }
    );
  }

  private async initScrollAnimation(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    const el = this.sectionRef()?.nativeElement;
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 75%' },
      defaults: { ease: 'power3.out' },
    });

    // Badge + title reveal
    tl.fromTo(
      el.querySelector('.solutions__subtitle'),
      { opacity: 0, y: rm ? 0 : 20 },
      { opacity: 1, y: 0, duration: rm ? 0.01 : 0.5 }
    ).fromTo(
      el.querySelector('.solutions__title'),
      { opacity: 0, y: rm ? 0 : 30, filter: rm ? 'none' : 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: rm ? 0.01 : 0.7 },
      '-=0.2'
    );

    // Bento cards with alternating directional entrance
    const cards = el.querySelectorAll('.solutions__card');
    cards.forEach((card: HTMLElement, i: number) => {
      const fromLeft = i % 2 === 0;
      tl.fromTo(
        card,
        {
          opacity: 0,
          x: rm ? 0 : (fromLeft ? -40 : 40),
          y: rm ? 0 : 30,
          scale: rm ? 1 : 0.96,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: rm ? 0.01 : 0.7,
          ease: 'power2.out',
          clearProps: 'transform',
        },
        i === 0 ? '-=0.2' : '-=0.45'
      );
    });
  }
}
