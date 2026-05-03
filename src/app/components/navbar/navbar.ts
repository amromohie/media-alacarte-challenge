import { Component, input, output, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  imports: [TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  currentLang = input<string>('en');
  languageChange = output<string>();
  mobileMenuOpen = signal(false);
  activeLink = signal('platform');

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
