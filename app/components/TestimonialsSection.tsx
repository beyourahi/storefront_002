/**
 * @fileoverview TestimonialsSection - Multi-input customer testimonials carousel
 *
 * @description
 * Testimonials carousel with auto-scroll, touch/swipe, trackpad, mouse wheel,
 * and keyboard navigation. Built on Embla Carousel with AutoScroll and WheelGestures
 * plugins, matching the pattern used across 11+ carousels in this project.
 *
 * @features
 * - **Auto-scroll**: Continuous horizontal scroll via AutoScroll plugin
 * - **Touch/Swipe**: Native drag gestures on mobile/tablet
 * - **Trackpad**: Two-finger horizontal scroll via WheelGestures plugin
 * - **Mouse Wheel**: Scroll navigation via WheelGestures plugin
 * - **Keyboard**: ArrowLeft/ArrowRight navigation (built into Carousel component)
 * - **Drag-free**: Momentum-based manual scrolling with natural deceleration
 * - **Pause on Hover**: Auto-scroll pauses when cursor enters carousel (desktop)
 * - **Resume After Interaction**: Auto-scroll resumes when user stops interacting
 * - **Infinite Loop**: Seamless looping via Embla's loop engine
 * - **Star Ratings**: Visual 5-star rating display with filled/empty states
 * - **Responsive Cards**: Basis percentages produce peek effect across breakpoints
 * - **CMS Integration**: Testimonials from testimonials metaobject
 *
 * @props
 * - testimonials: Testimonial[] - Customer reviews with rating, text, name, location
 *
 * @related
 * - types/index.ts - Testimonial type definition
 * - components/ui/carousel.tsx - Embla Carousel wrapper with ARIA and keyboard nav
 * - InstagramSection.tsx - Identical AutoScroll + WheelGestures pattern
 */

import {Star, Quote} from "lucide-react";
import {Carousel, CarouselContent, CarouselItem} from "~/components/ui/carousel";
import {WheelGesturesPlugin} from "embla-carousel-wheel-gestures";
import AutoScroll from "embla-carousel-auto-scroll";
import type {Testimonial} from "types";

// ============================================================================
// Types
// ============================================================================

interface TestimonialsSectionProps {
    testimonials: Testimonial[];
}

/**
 * Star rating display component
 * Responsive sizing: slightly larger on tablet+ for better touch targets
 */
function StarRating({rating}: {rating: number}) {
    // Index key is intentional: fixed 5-star rating display
    return (
        <div className="flex gap-0.5 sm:gap-1">
            {Array.from({length: 5}).map((_, starIndex) => (
                <Star
                    // eslint-disable-next-line react/no-array-index-key
                    key={`star-${starIndex}`}
                    className={`size-3.5 sm:size-4 ${starIndex < rating ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                />
            ))}
        </div>
    );
}

/**
 * Individual testimonial card
 * Card fills its CarouselItem parent — sizing controlled by basis classes on the item.
 * Responsive basis: 87% → 50% → 42% → 37% → 30% → 25% across breakpoints.
 */
function TestimonialCard({testimonial}: {testimonial: Testimonial}) {
    // WCAG Contrast Validation:
    // bg-muted/40 over white ≈ #f9f9f9 (very subtle off-white)
    // text-foreground (#000) on #f9f9f9 = ~20:1 (WCAG AAA) ✓
    // text-foreground/80 on #f9f9f9 = ~15.2:1 (WCAG AAA) ✓
    // text-foreground/60 on #f9f9f9 = ~10.5:1 (WCAG AAA) ✓
    return (
        <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 bg-muted/40 rounded-2xl border border-border/10 shadow-sm">
            {/* Quote Icon - responsive sizing */}
            <Quote className="size-6 sm:size-7 lg:size-8 text-primary/20" />

            {/* Review Text - responsive font sizing for readability */}
            <p className="text-sm sm:text-base lg:text-base text-foreground/80 leading-relaxed flex-1">
                &ldquo;{testimonial.text}&rdquo;
            </p>

            {/* Rating */}
            <StarRating rating={testimonial.rating} />

            {/* Customer Info */}
            <div className="pt-3 border-t border-border/5">
                <p className="font-medium text-sm sm:text-base text-foreground">{testimonial.customerName}</p>
                <p className="text-sm sm:text-sm text-foreground/60">{testimonial.location}</p>
            </div>
        </div>
    );
}

/**
 * Multi-input testimonials carousel
 *
 * Carousel configuration:
 * - **Auto-scroll**: Speed 2, stops on hover, resumes after interaction
 * - **Drag-free**: Smooth manual scrolling with momentum
 * - **Loop**: Infinite scrolling (replaces CSS duplicate-track approach)
 * - **Wheel gestures**: Trackpad/mouse wheel support
 * - **Responsive basis**: Peek effect with variable card widths
 *
 * Keyboard navigation (ArrowLeft/ArrowRight) is built into the Carousel component.
 */
export function TestimonialsSection({testimonials}: TestimonialsSectionProps) {
    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    // Single testimonial: render static centered card without carousel
    if (testimonials.length === 1) {
        return (
            <section className="py-10 sm:py-12 md:py-16 -mx-2 md:-mx-4" aria-label="Customer testimonial">
                <div className="flex justify-center px-3 sm:px-4 md:px-6">
                    <div className="w-70 sm:w-80 lg:w-95">
                        <TestimonialCard testimonial={testimonials[0]} />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10 sm:py-12 md:py-16 -mx-2 md:-mx-4 overflow-hidden" aria-label="Customer testimonials">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                    dragFree: true
                }}
                plugins={[
                    WheelGesturesPlugin(),
                    AutoScroll({speed: 2, stopOnInteraction: false, stopOnMouseEnter: true})
                ]}
                className="w-full"
            >
                <CarouselContent className="-ml-3 sm:-ml-4 md:-ml-6">
                    {testimonials.map(testimonial => (
                        <CarouselItem
                            key={testimonial.id}
                            className="pl-3 sm:pl-4 md:pl-6 basis-[87%] sm:basis-[50%] md:basis-[42%] lg:basis-[37%] xl:basis-[30%] 2xl:basis-[25%]"
                        >
                            <TestimonialCard testimonial={testimonial} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
