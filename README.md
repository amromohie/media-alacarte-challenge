# Media Alacarte – Frontend Engineering Challenge

A premium, interactive, and high-performance landing page built for the **Media Alacarte** Angular Frontend Engineer coding challenge.

**🌐 Live Demo:** [https://media-alacarte-challenge-ebon.vercel.app](https://media-alacarte-challenge-ebon.vercel.app)

## 🎨 Design Philosophy & Features
This project implements a modern, dark-themed SaaS aesthetic. The focus was on delivering a pixel-perfect, engaging user experience without sacrificing performance or accessibility.

### Key Highlights
- **Dynamic SVG Masking:** The Hero section features a complex, responsive layout where floating CTA buttons carve pixel-perfect "pill" cutouts with inverted-radius corners directly out of the image card using advanced SVG masking (`feGaussianBlur` + `feColorMatrix`).
- **Premium Micro-Interactions:** Custom 3D tilt effects on service cards, glowing background orbs, and glassmorphic (`backdrop-filter`) UI elements.
- **Performant Animations:** Integrated **GSAP (GreenSock)** for highly optimized scroll-triggered reveals, choreographed entrance timelines, and continuous attention-loop micro-interactions, avoiding heavy CSS-in-JS overhead.

## 🏗️ Technical Architecture
Industry best practices were strictly followed to ensure clean, maintainable, and scalable code:

- **Angular 19+ Best Practices:** Utilized `ChangeDetectionStrategy.OnPush` across presentation components to optimize rendering cycles. Code is strictly typed and heavily documented using JSDoc.
- **Memory Management:** Robust cleanup of GSAP tweens, `ScrollTrigger` instances, and `ResizeObserver`s within `ngOnDestroy` lifecycle hooks to prevent memory leaks.
- **SCSS Token System:** Styled using an ITCSS-inspired global architecture (`src/styles`). Design tokens (colors, fonts, breakpoints) are centralized in CSS variables for effortless theming and consistency.
- **Accessibility (a11y):** Semantic HTML5 structures, proper `aria-labels`, descriptive `alt` tags, and full respect for the user's `prefers-reduced-motion` OS settings via a centralized `AnimationService`.

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- Angular CLI (`npm install -g @angular/cli`)

### Installation & Setup

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd media-alacarte-landing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   ng serve
   ```

4. **View the application:**
   Open your browser and navigate to [http://localhost:4200/](http://localhost:4200/).

## 🛠️ Tech Stack
- **Framework:** Angular 21.1.4
- **Styling:** SCSS (Vanilla CSS Grid & Flexbox)
- **Animation:** GSAP (Core + ScrollTrigger)
- **i18n:** ngx-translate

---
*Developed by Amr Badawy.*
