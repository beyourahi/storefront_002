/**
 * @fileoverview BrandMarquee - Infinite scrolling brand values display
 *
 * @description
 * Horizontal auto-scrolling marquee displaying brand values/keywords from CMS.
 * Uses CSS animation with duplicate tracks for seamless infinite loop.
 *
 * @features
 * - **Infinite Scroll**: Duplicate tracks create seamless loop effect
 * - **Auto-scroll**: CSS animation with pause on hover/active
 * - **Responsive Typography**: 48px → 72px → 96px across breakpoints
 * - **Accessibility**: Respects prefers-reduced-motion, pauses on interaction
 * - **CMS Integration**: Brand words from site_settings metaobject
 *
 * @props
 * None - BrandMarquee is self-contained and pulls data from site settings context
 *
 * @related
 * - lib/site-content-context.ts - Provides brandMarquee.words array
 * - app/styles/tailwind.css - Marquee animation keyframes
 */

import {useBrandMarquee} from "~/lib/site-content-context";

/**
 * BrandMarquee - Infinite scrolling brand words
 *
 * Animation behavior:
 * - Continuous scroll via CSS animation (animate-marquee)
 * - Pauses on hover (desktop) and active/tap (mobile)
 * - Pauses for users with prefers-reduced-motion
 *
 * Responsive Features:
 * - Font size: 48px → 72px → 96px (mobile → tablet → desktop)
 * - Animation speed: 60s → 80s → 100s (faster on mobile due to smaller content width)
 * - Gap: 32px → 56px (mobile → tablet+)
 * - Pause: Hover on desktop, tap on mobile
 * - Accessibility: Respects prefers-reduced-motion
 */
export function BrandMarquee() {
    const {words} = useBrandMarquee();
    return (
        <section className="-mx-2 md:-mx-4 py-8 md:py-12 overflow-hidden" aria-label="Brand values">
            {/* Group container enables hover/active pause on child animations */}
            <div className="group relative flex cursor-default select-none">
                {/* First marquee track */}
                <div
                    className="flex shrink-0 animate-marquee will-change-transform
                        group-hover:paused group-active:paused motion-reduce:paused"
                >
                    {words.map(word => (
                        <span
                            key={`first-${word}`}
                            className="mx-8 md:mx-14 text-4xl sm:text-5xl md:text-6xl font-sans font-medium text-primary uppercase whitespace-nowrap"
                        >
                            {word}
                        </span>
                    ))}
                </div>

                {/* Duplicate track for seamless loop */}
                <div
                    className="flex shrink-0 animate-marquee will-change-transform
                        group-hover:paused group-active:paused motion-reduce:paused"
                    aria-hidden="true"
                >
                    {words.map(word => (
                        <span
                            key={`second-${word}`}
                            className="mx-8 md:mx-14 text-4xl sm:text-5xl md:text-6xl font-sans font-medium text-primary uppercase whitespace-nowrap"
                        >
                            {word}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
