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
  selector: 'app-footer',
  imports: [TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);

  sectionRef = viewChild<ElementRef>('sectionRef');
  columnRefs = viewChildren<ElementRef>('columnRef');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimation();
    }
  }

  private async initScrollAnimation(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    const el = this.sectionRef()?.nativeElement;
    const columns = this.columnRefs().map(c => c.nativeElement);

    if (!el) return;

    // Subtle fade-up for footer grid children
    if (columns.length) {
      gsap.from(columns, {
        opacity: 0,
        y: rm ? 0 : 30,
        stagger: rm ? 0 : 0.1,
        duration: rm ? 0.01 : this.anim.DURATIONS.BASE,
        ease: this.anim.EASES.SMOOTH,
        scrollTrigger: { trigger: el, start: 'top 95%' },
      });
    }
  }
}
