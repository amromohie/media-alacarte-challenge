import { Component, inject, AfterViewInit, PLATFORM_ID, ElementRef, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  sectionRef = viewChild<ElementRef>('sectionRef');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimation();
    }
  }

  private async initScrollAnimation(): Promise<void> {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    const el = this.sectionRef()?.nativeElement;
    if (!el) return;

    // Subtle fade-up for footer grid children
    const columns = el.querySelectorAll('.footer__brand, .footer__links-col, .footer__contact');
    if (columns.length) {
      gsap.from(columns, {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    }
  }
}
