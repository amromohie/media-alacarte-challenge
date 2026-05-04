import { Component, input, output, signal, inject, AfterViewInit, PLATFORM_ID, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-navbar',
  imports: [TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  private el = inject(ElementRef);

  currentLang = input<string>('en');
  languageChange = output<string>();
  mobileMenuOpen = signal(false);
  activeLink = signal('platform');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initEntranceAnimation();
    }
  }

  private async initEntranceAnimation(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    // Reveal the host element (which is hidden in CSS to prevent FOUC)
    gsap.set(this.el.nativeElement, { visibility: 'visible' });

    gsap.fromTo(this.el.nativeElement,
      { opacity: 0, y: rm ? 0 : -30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: rm ? 0.01 : 1.2, 
        ease: 'power3.out',
        delay: 0.1 // Slight delay to ensure layout stability
      }
    );
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleLang(): void {
    const newLang = this.currentLang() === 'en' ? 'ar' : 'en';
    this.languageChange.emit(newLang);
    this.mobileMenuOpen.set(false);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  setActiveLink(link: string): void {
    this.activeLink.set(link);
    this.closeMobileMenu();
  }
}
