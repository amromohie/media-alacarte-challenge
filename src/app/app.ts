import { Component, inject, signal, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from './components/navbar/navbar';
import { HeroComponent } from './components/hero/hero';
import { MarqueeBannerComponent } from './components/marquee-banner/marquee-banner';
import { ServicesComponent } from './components/services/services';
import { SolutionsComponent } from './components/solutions/solutions';
import { CollaborationComponent } from './components/collaboration/collaboration';
import { CtaSectionComponent } from './components/cta-section/cta-section';
import { FooterComponent } from './components/footer/footer';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  imports: [
    TranslateModule,
    NavbarComponent,
    HeroComponent,
    MarqueeBannerComponent,
    ServicesComponent,
    SolutionsComponent,
    CollaborationComponent,
    CtaSectionComponent,
    FooterComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private translate = inject(TranslateService);
  private seo = inject(SeoService);

  currentLang = signal<string>('en');

  ngOnInit(): void {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.updateSeo();
  }

  switchLanguage(lang: string): void {
    this.currentLang.set(lang);
    this.translate.use(lang);
    this.seo.updateLanguage(lang);
    this.updateSeo();
  }

  private updateSeo(): void {
    const lang = this.currentLang();
    const isAr = lang === 'ar';

    this.seo.updateSeo({
      title: isAr
        ? 'ميديا ألاكارت — منصة شراء الإعلانات | سوق إعلاني'
        : 'Media Ala Carte — Media Buying Platform | Advertising Marketplace',
      description: isAr
        ? 'ميديا ألاكارت هي منصة سوق إعلاني تبسط شراء الوسائط باستخدام البيانات والأتمتة والتعاون لتعظيم العائد على الاستثمار.'
        : 'Media Ala Carte is a media marketplace platform that simplifies media buying using data, automation, and collaboration to maximize ROI.',
      keywords: 'media buying platform, advertising marketplace, campaign analytics, media automation, ROI optimization',
    });
    this.seo.updateLanguage(lang);
  }
}
