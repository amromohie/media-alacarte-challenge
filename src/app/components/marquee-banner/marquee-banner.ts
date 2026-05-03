import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * MarqueeBannerComponent
 * 
 * Displays an infinite scrolling marquee of logos/brands.
 * Built entirely with performant CSS animations (no JS overhead).
 * Uses OnPush change detection for optimized rendering performance.
 */
@Component({
  selector: 'app-marquee-banner',
  imports: [TranslateModule],
  templateUrl: './marquee-banner.html',
  styleUrl: './marquee-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarqueeBannerComponent {}
