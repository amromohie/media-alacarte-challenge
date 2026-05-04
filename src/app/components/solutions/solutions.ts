import {
  Component,
  inject,
  AfterViewInit,
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
  selector: 'app-solutions',
  imports: [TranslateModule],
  templateUrl: './solutions.html',
  styleUrl: './solutions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionsComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  
  sectionRef = viewChild<ElementRef>('sectionRef');
  subtitleRef = viewChild<ElementRef>('subtitleRef');
  titleRef = viewChild<ElementRef>('titleRef');
  cardRefs = viewChildren<ElementRef>('cardRef');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initCardHover();
      this.initScrollAnimation();
    }
  }

  private async initCardHover(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;

    this.cardRefs().forEach((cardRef) => {
      const card = cardRef.nativeElement;
      const arrow = card.querySelector('.solutions__card-arrow');
      if (!arrow) return;

      card.addEventListener('mouseenter', () => {
        gsap.to(arrow, { x: 3, y: -3, duration: this.anim.DURATIONS.QUICK, ease: this.anim.EASES.SMOOTH, overwrite: 'auto' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(arrow, { x: 0, y: 0, duration: 0.35, ease: this.anim.EASES.DECELERATE, overwrite: 'auto' });
      });
    });
  }

  private async initScrollAnimation(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    const el = this.sectionRef()?.nativeElement;
    const subtitle = this.subtitleRef()?.nativeElement;
    const title = this.titleRef()?.nativeElement;
    const cards = this.cardRefs().map(c => c.nativeElement);

    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 75%' },
      defaults: { ease: this.anim.EASES.DECELERATE },
    });

    // Badge + title reveal
    if (subtitle) {
      tl.fromTo(
        subtitle,
        { opacity: 0, y: rm ? 0 : 20 },
        { opacity: 1, y: 0, duration: rm ? 0.01 : 0.5 }
      );
    }

    if (title) {
      tl.fromTo(
        title,
        { opacity: 0, y: rm ? 0 : 30, filter: rm ? 'none' : 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: rm ? 0.01 : this.anim.DURATIONS.BASE },
        '-=0.2'
      );
    }

    // Cards stagger
    if (cards.length) {
      cards.forEach((card, i) => {
        tl.fromTo(
          card,
          {
            opacity: 0,
            x: rm ? 0 : (i % 2 === 0 ? -30 : 30),
            y: rm ? 0 : 30,
            scale: rm ? 1 : 0.95,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: rm ? 0.01 : this.anim.DURATIONS.BASE,
            ease: this.anim.EASES.SMOOTH,
            clearProps: 'transform',
          },
          i === 0 ? '-=0.2' : '-=0.45'
        );
      });
    }
  }
}
