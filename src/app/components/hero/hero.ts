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
 * HeroComponent
 * 
 * Renders the modern typography-driven landing hero section.
 * Features floating glassmorphic cards and dynamic background animations.
 */
@Component({
  selector: 'app-hero',
  imports: [TranslateModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private anim = inject(AnimationService);
  
  badge = viewChild<ElementRef>('badge');
  subtitle = viewChild<ElementRef>('subtitle');
  title = viewChild<ElementRef>('title');
  description = viewChild<ElementRef>('description');
  actionsRef = viewChild<ElementRef>('actionsRef');
  visualContainer = viewChild<ElementRef>('visualContainer');
  coreRef = viewChild<ElementRef>('coreRef');
  mediaNodes = viewChildren<ElementRef>('mediaNode');
  metricBubbles = viewChildren<ElementRef>('metricBubble');
  packets = viewChildren<ElementRef>('packet');
  paths = viewChildren<ElementRef>('pathNode');
  glowCyan = viewChild<ElementRef>('glowCyan');
  glowPurple = viewChild<ElementRef>('glowPurple');

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initAnimations();
      }, 50);
    }
  }

  private async initAnimations(): Promise<void> {
    await this.anim.ready();
    const gsap = this.anim.gsap;
    const rm = this.anim.prefersReducedMotion();

    const els = {
      badge: this.badge()?.nativeElement,
      subtitle: this.subtitle()?.nativeElement,
      title: this.title()?.nativeElement,
      description: this.description()?.nativeElement,
      actions: this.actionsRef()?.nativeElement,
      visual: this.visualContainer()?.nativeElement,
      core: this.coreRef()?.nativeElement,
      nodes: this.mediaNodes().map((n: ElementRef) => n.nativeElement),
      metrics: this.metricBubbles().map((m: ElementRef) => m.nativeElement),
      packets: this.packets().map((p: ElementRef) => p.nativeElement),
      paths: this.paths().map((p: ElementRef) => p.nativeElement),
      glowCyan: this.glowCyan()?.nativeElement,
      glowPurple: this.glowPurple()?.nativeElement,
    };

    if (!els.badge) return;

    // ── Entrance Timeline ──────────────────────────────────────
    const tl = gsap.timeline({ 
      delay: 0.1,
      defaults: { ease: "expo.out" } 
    });

    // 1. Badge Reveal (Slide + Fade)
    tl.fromTo(els.badge,
      { opacity: 0, y: rm ? 0 : 40, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2 }
    )
    // 2. Subtitle (Staggered tracking + fade)
    .fromTo(els.subtitle,
      { opacity: 0, letterSpacing: '1em', y: 10 },
      { opacity: 1, letterSpacing: '0.6em', y: 0, duration: 1.5 },
      '-=1'
    )
    // 3. Title (Skew + Scale + Blur reveal)
    .fromTo(els.title,
      { opacity: 0, y: 50, skewY: 7, scale: 0.9, filter: 'blur(15px)' },
      { opacity: 1, y: 0, skewY: 0, scale: 1, filter: 'blur(0px)', duration: 1.8, ease: "power4.out" },
      '-=1.2'
    )
    // 4. Description (Soft fade up)
    .fromTo(els.description,
      { opacity: 0, y: 20, filter: 'blur(5px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2 },
      '-=1.4'
    )
    // 5. Actions (Bounce in)
    .fromTo(els.actions,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)" },
      '-=1'
    )
    // 6. Visual Core (Deep blur reveal)
    .fromTo(els.core,
      { opacity: 0, scale: 0.4, filter: 'blur(30px)', rotate: -15 },
      { opacity: 1, scale: 1, filter: 'blur(0px)', rotate: 0, duration: 1.5, ease: "elastic.out(1, 0.75)" },
      '-=1.5'
    )
    // 7. Network Paths (Drawing effect)
    .fromTo(els.paths,
      { strokeDasharray: 1000, strokeDashoffset: 1000, opacity: 0 },
      { strokeDashoffset: 0, opacity: 1, duration: 2, ease: "power3.inOut" },
      '-=1.2'
    )
    // 8. Nodes (Pop in)
    .fromTo(els.nodes,
      { opacity: 0, scale: 0.5, y: 40, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.1, ease: "back.out(1.5)" },
      '-=1.5'
    )
    // 9. Metrics (Elastic reveal)
    .fromTo(els.metrics,
      { opacity: 0, scale: 0, rotate: 10 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.8, stagger: 0.2, ease: "back.out(2)" },
      '-=0.8'
    );

    // ── Subtle Floating Animation for Title & Core ──────────────────
    if (!rm) {
      gsap.to(els.title, {
        y: 10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(els.core, {
        y: -15,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5
      });
    }

    if (!rm) {
      // ── Continuous Data Packets Animation ──────────────────────
      els.packets.forEach((packet: HTMLElement, i: number) => {
        const path = els.paths[i % els.paths.length] as SVGPathElement;
        const length = path.getTotalLength();
        
        gsap.fromTo(packet, 
          { x: 0, y: 0, opacity: 0 },
          {
            duration: 2 + Math.random() * 2,
            repeat: -1,
            ease: "none",
            delay: i * 0.8,
            onUpdate: function(this: any) {
              const progress = this['progress']();
              const p = path.getPointAtLength(progress * length);
              gsap.set(packet, { 
                attr: { cx: p.x, cy: p.y }, 
                opacity: progress < 0.1 ? progress * 10 : (progress > 0.9 ? (1 - progress) * 10 : 1) 
              });
            }
          }
        );
      });

      // ── AI Core Pulse ──────────────────────────────────────────
      gsap.to(els.core, {
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // ── Media Nodes Float ──────────────────────────────────────
      els.nodes.forEach((node: HTMLElement, i: number) => {
        gsap.to(node, {
          y: '+=15',
          duration: 3 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.4
        });
      });

      // ── Background Glows ──────────────────────────────────────
      [els.glowCyan, els.glowPurple].forEach((glow: HTMLElement | undefined, i: number) => {
        if (glow) {
          gsap.to(glow, {
            x: i === 0 ? 40 : -40,
            y: i === 0 ? -20 : 20,
            duration: 12,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        }
      });
    }
  }
}
