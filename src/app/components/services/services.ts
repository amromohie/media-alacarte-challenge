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

/**
 * ServicesComponent
 * 
 * Renders the services bento grid with 3D tilt effects and entrance animations.
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
  iconRef = viewChild<ElementRef>('iconRef');
  titleRef = viewChild<ElementRef>('titleRef');
  cardRefs = viewChildren<ElementRef>('cardRef');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initCardInteractions();
      this.initScrollAnimation();
    }
  }

  /**
   * CSS class toggle for overlay visibility.
   * GSAP tilt is handled separately in initCardInteractions().
   */
  private initCardHoverClass(): void {
    this.cardRefs().forEach((cardRef) => {
      const card = cardRef.nativeElement;
      if (card.classList.contains('services__card--tall')) {
        card.addEventListener('mouseenter', () => card.classList.add('is-hovered'));
        card.addEventListener('mouseleave', () => card.classList.remove('is-hovered'));
      }
    });
  }

  /** 3D tilt + lift hover on all cards, CSS class toggle on tall cards. */
  private async initCardInteractions(): Promise<void> {
    this.initCardHoverClass();

    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    this.cardRefs().forEach((cardRef) => {
      const card = cardRef.nativeElement;
      if (!card) return;

      // 1. Arrow Micro-interaction
      const arrow = card.querySelector('.services__card-arrow');
      if (arrow) {
        card.addEventListener('mouseenter', () => {
          gsap.to(arrow, { x: 5, y: -5, duration: this.anim.DURATIONS.QUICK, ease: this.anim.EASES.SMOOTH, overwrite: 'auto' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(arrow, { x: 0, y: 0, duration: this.anim.DURATIONS.BASE, ease: this.anim.EASES.SMOOTH, overwrite: 'auto' });
        });
      }

      // 2. 3D Tilt Effect
      if (!rm) {
        this.anim.addTiltHover(card, 5);
      }
    });
  }

  private async initScrollAnimation(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    const el = this.sectionRef()?.nativeElement;
    const icon = this.iconRef()?.nativeElement;
    const title = this.titleRef()?.nativeElement;
    const cards = this.cardRefs().map(c => c.nativeElement);

    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
      },
      defaults: { ease: this.anim.EASES.DECELERATE },
    });

    if (icon) {
      tl.from(icon, {
        opacity: 0,
        scale: 0.5,
        rotation: -45,
        duration: rm ? 0.01 : 0.8,
        ease: 'back.out(1.7)',
      });
    }

    if (title) {
      tl.from(
        title,
        {
          opacity: 0,
          y: rm ? 0 : 30,
          filter: rm ? 'none' : 'blur(8px)',
          duration: rm ? 0.01 : this.anim.DURATIONS.BASE,
        },
        '-=0.5'
      );
    }

    if (cards.length) {
      tl.from(
        cards,
        {
          opacity: 0,
          y: rm ? 0 : 50,
          scale: rm ? 1 : 0.95,
          stagger: rm ? 0 : 0.15,
          duration: rm ? 0.01 : this.anim.DURATIONS.ENTRANCE,
          clearProps: 'transform',
        },
        '-=0.4'
      );
    }
  }
}
