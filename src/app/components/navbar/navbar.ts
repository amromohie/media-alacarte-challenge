import {
  Component,
  input,
  output,
  signal,
  inject,
  AfterViewInit,
  PLATFORM_ID,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-navbar',
  imports: [TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  private el = inject(ElementRef);

  navRef = viewChild<ElementRef>('navRef');
  logoRef = viewChild<ElementRef>('logoRef');
  linksRef = viewChild<ElementRef>('linksRef');
  actionsRef = viewChild<ElementRef>('actionsRef');

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

    const logo = this.logoRef()?.nativeElement;
    const links = this.linksRef()?.nativeElement?.querySelectorAll('li');
    const actions = this.actionsRef()?.nativeElement;

    // Reveal the host element
    gsap.set(this.el.nativeElement, { visibility: 'visible' });

    const tl = gsap.timeline({
      defaults: { ease: this.anim.EASES.DECELERATE },
    });

    // Main bar slide down
    tl.fromTo(this.el.nativeElement,
      { opacity: 0, y: rm ? 0 : -30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: rm ? 0.01 : this.anim.DURATIONS.SLOW,
        delay: 0.1 
      }
    );

    // Stagger elements
    if (logo) {
      tl.fromTo(logo, 
        { opacity: 0, x: -20 }, 
        { opacity: 1, x: 0, duration: 0.5, clearProps: 'all' }, 
        '-=0.4'
      );
    }

    if (links?.length) {
      tl.fromTo(links, 
        { opacity: 0, y: -10 }, 
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, clearProps: 'all' }, 
        '-=0.3'
      );
    }

    if (actions) {
      tl.fromTo(actions, 
        { opacity: 0, x: 20 }, 
        { opacity: 1, x: 0, duration: 0.5, clearProps: 'all' }, 
        '-=0.4'
      );
    }
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
