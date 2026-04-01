/**
 * @fileoverview InstagramSection - Auto-scrolling Instagram gallery carousel
 *
 * @description
 * Displays Instagram feed images and videos in an auto-scrolling carousel with manual
 * controls. Features hover pause, trackpad support, and CTA linking to Instagram profile.
 *
 * @features
 * - **Auto-scroll**: Continuous horizontal scroll with pause on hover
 * - **Mixed Media**: Supports both images and videos (with preview thumbnails)
 * - **Carousel Controls**: Embla Carousel with drag, wheel gestures, infinite loop
 * - **CMS Integration**: Media from instagram_media metaobject, handle from social_links
 * - **Responsive Sizing**: 80% → 45% → 32% → 27% → 22% basis across breakpoints
 * - **Accessibility**: Proper ARIA labels, video play indicators
 *
 * @props
 * - media: InstagramMedia[] - Instagram posts with URLs, alt text, media type
 *
 * @related
 * - types/index.ts - InstagramMedia type definition
 * - lib/site-content-context.ts - Instagram title and social links
 * - CuratedCollections.tsx - Similar Embla Carousel implementation
 */

import {Instagram, Play} from "lucide-react";
import {Carousel, CarouselContent, CarouselItem} from "~/components/ui/carousel";
import {WheelGesturesPlugin} from "embla-carousel-wheel-gestures";
import AutoScroll from "embla-carousel-auto-scroll";
import type {InstagramMedia} from "types";
import {useSectionHeadings, useSocialLinks} from "~/lib/site-content-context";

// ============================================================================
// Types
// ============================================================================

interface InstagramSectionProps {
    media: InstagramMedia[];
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * InstagramSection - Draggable carousel of Instagram media (images and videos)
 *
 * Carousel configuration:
 * - **Auto-scroll**: Speed 1, stops on interaction, pauses on hover
 * - **Drag-free**: Smooth manual scrolling with momentum
 * - **Loop**: Infinite scrolling for continuous feed feel
 * - **Wheel gestures**: Trackpad/mouse wheel support
 * - **Responsive basis sizing**: Peek effect with variable card widths
 *
 * CMS Integration:
 * - Section title from site_settings.instagramTitle
 * - Instagram handle and URL from social_links metaobject
 * - Media array from instagram_media metaobject (images + videos)
 */
export function InstagramSection({media}: InstagramSectionProps) {
    const {instagramTitle} = useSectionHeadings();
    const socialLinks = useSocialLinks();

    // Find Instagram link from social links
    const instagramLink = socialLinks.find(link => link.platform.toLowerCase() === "instagram");
    const instagramUrl = instagramLink?.url || "https://instagram.com";
    const instagramHandle = instagramLink?.handle || "@beyourahi_";

    // Detect generic platform URLs that don't point to a real brand profile.
    // When no brand profile is configured, hide the follow CTA to avoid
    // linking users to the Instagram homepage or a placeholder URL.
    const isGenericInstagramUrl = /^https?:\/\/(www\.)?instagram\.com\/?$/i.test(instagramUrl);

    // Return null if no media
    if (!media || media.length === 0) {
        return null;
    }

    return (
        <section className="-mx-2 md:-mx-4 bg-background py-10 sm:py-12 md:py-16" aria-label="Instagram gallery">
            {/* Header */}
            <div className="mb-6 flex flex-col items-center justify-center gap-3 px-4 sm:mb-8 sm:flex-row sm:gap-4">
                <h2 className="m-0 font-serif text-xl font-normal text-foreground sm:text-2xl md:text-3xl">
                    {instagramTitle}
                </h2>
                {/* Hide follow CTA when the URL is a generic platform homepage (no brand profile configured) */}
                {!isGenericInstagramUrl && (
                    <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-3 sm:px-4 py-1.5 sm:py-2 font-sans text-base sm:text-lg md:text-xl font-medium text-primary motion-interactive hover:bg-primary hover:text-primary-foreground hover:no-underline"
                    >
                        {instagramHandle}
                    </a>
                )}
            </div>

            {/* Carousel - edge-to-edge with no gaps, auto-scrolling */}
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                    dragFree: true
                }}
                plugins={[
                    WheelGesturesPlugin(),
                    AutoScroll({speed: 1, stopOnInteraction: false, stopOnMouseEnter: true})
                ]}
                className="w-full"
            >
                <CarouselContent className="ml-0">
                    {media.map((item, index) => (
                        <CarouselItem
                            key={item.id}
                            className="pl-0 basis-[80%] sm:basis-[45%] lg:basis-[32%] xl:basis-[27%] 2xl:basis-[22%]"
                        >
                            <InstagramMediaCard media={item} index={index} instagramUrl={instagramUrl} isGeneric={isGenericInstagramUrl} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}

/**
 * Individual Instagram media card with hover effects
 * Supports both images and videos
 */
function InstagramMediaCard({
    media,
    index,
    instagramUrl,
    isGeneric
}: {
    media: InstagramMedia;
    index: number;
    instagramUrl: string;
    isGeneric: boolean;
}) {
    const isVideo = media.mediaType === "video";

    const mediaContent = (
        <>
            {/* Image or Video Preview */}
            {isVideo ? (
                <>
                    {/* Video with preview image fallback */}
                    {media.previewImage?.url ? (
                        <img
                            src={media.previewImage.url}
                            alt={media.altText || `Instagram video ${index + 1}`}
                            width={400}
                            height={400}
                            loading="lazy"
                            className="absolute inset-0 size-full rounded-none object-cover motion-image group-hover:scale-105"
                        />
                    ) : (
                        <video
                            src={media.url}
                            muted
                            playsInline
                            className="absolute inset-0 size-full rounded-none object-cover motion-image group-hover:scale-105"
                        />
                    )}
                    {/* Play icon indicator for videos */}
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/60 p-1.5">
                        <Play className="size-4 fill-white text-white" />
                    </div>
                </>
            ) : (
                <img
                    src={media.url}
                    alt={media.altText || `Instagram post ${index + 1}`}
                    width={400}
                    height={400}
                    loading="lazy"
                    className="absolute inset-0 size-full rounded-none object-cover motion-image group-hover:scale-105"
                />
            )}

            {/* Hover Overlay — only show Instagram CTA when linked to a real profile */}
            {!isGeneric && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 motion-overlay group-hover:bg-black/40 group-active:bg-black/40">
                    <div className="flex flex-col items-center gap-2 opacity-0 motion-overlay group-hover:opacity-100 group-active:opacity-100">
                        <Instagram className="size-6 text-white sm:size-8" />
                        <span className="text-sm font-medium text-white sm:text-sm">View on Instagram</span>
                    </div>
                </div>
            )}
        </>
    );

    // When the URL is a generic platform homepage, render as a non-clickable div
    // so the gallery serves as a pure visual element without dead links
    if (isGeneric) {
        return (
            <div className="group relative block aspect-square overflow-hidden">
                {mediaContent}
            </div>
        );
    }

    return (
        <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square overflow-hidden"
            aria-label={`View Instagram ${isVideo ? "video" : "post"} ${index + 1} - opens in new tab`}
        >
            {mediaContent}
        </a>
    );
}
