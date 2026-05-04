import { Directive, ElementRef, Input, AfterViewInit, OnDestroy, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * PillMaskDirective
 * 
 * Decouples geometric SVG masking logic from the component.
 * Tracks target elements (buttons) and updates SVG mask coordinates dynamically.
 */
@Directive({
  selector: '[appPillMask]',
  standalone: true
})
export class PillMaskDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  @Input('appPillMaskTargets') targets: { selector: string; maskId: string }[] = [];
  
  private ro?: ResizeObserver;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initObserver();
    }
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  private initObserver(): void {
    const svgEl = this.el.nativeElement as SVGSVGElement;
    if (!svgEl || !window.ResizeObserver) return;

    // Fixed internal coordinate system
    const VB_W = 960;
    const VB_H = 540;
    const GAP_PX = 16;

    const update = () => {
      const svgRect = svgEl.getBoundingClientRect();
      if (svgRect.width === 0) return;

      const scaleX = VB_W / svgRect.width;
      const scaleY = VB_H / svgRect.height;
      const gapX = GAP_PX * scaleX;
      const gapY = GAP_PX * scaleY;

      this.targets.forEach(target => {
        const targetEl = document.querySelector(target.selector) as HTMLElement;
        const maskRect = document.querySelector(target.maskId) as SVGRectElement;

        if (targetEl && maskRect) {
          const b = targetEl.getBoundingClientRect();
          const x = (b.left - svgRect.left) * scaleX - gapX;
          const y = (b.top - svgRect.top) * scaleY - gapY;
          const w = b.width * scaleX + gapX * 2;
          const h = b.height * scaleY + gapY * 2;

          maskRect.setAttribute('x', `${x}`);
          maskRect.setAttribute('y', `${y}`);
          maskRect.setAttribute('width', `${w}`);
          maskRect.setAttribute('height', `${h}`);
        }
      });
    };

    // Run outside Angular to prevent unnecessary change detection cycles
    this.ngZone.runOutsideAngular(() => {
      this.ro = new ResizeObserver(() => {
        requestAnimationFrame(update);
      });

      this.ro.observe(svgEl);
      this.targets.forEach(t => {
        const el = document.querySelector(t.selector);
        if (el) this.ro?.observe(el);
      });

      // Initial calculation
      requestAnimationFrame(update);
    });
  }
}
