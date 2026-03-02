/**
 * @fileoverview Contact Page
 *
 * @description
 * Displays business contact information, location, hours, and social links.
 * Content is dynamically loaded from site_settings metaobject in Shopify.
 *
 * @route GET /contact
 *
 * @features
 * - Hero section with large typography
 * - Contact cards (email, phone, hours)
 * - Location/address section
 * - Social media links
 * - CMS-driven content (no hardcoded values)
 *
 * @design
 * Uses alternating background sections:
 * - Background color for hero and social
 * - Primary color for contact methods and location
 * - Animated hover effects on interactive elements
 *
 * @cms-integration
 * All content comes from site_settings metaobject:
 * - contact_email, contact_phone, business_hours
 * - address fields (street, city, state, zip, country)
 * - Social links array (platform, handle, url)
 *
 * @accessibility
 * - Semantic HTML (address, section, header)
 * - Touch-friendly tap targets (min-h-[60px])
 * - Color contrast compliant
 *
 * @related
 * - lib/site-content-context.tsx - Contact info hooks
 * - faq.tsx - Links from contact section
 * - Footer.tsx - Also displays contact info
 */

import type {Route} from "./+types/contact";
import {getSeoMeta} from "@shopify/hydrogen";
import {buildCanonicalUrl, getBrandNameFromMatches} from "~/lib/seo";
import {useContactInfo, useSocialLinks} from "~/lib/site-content-context";

export const meta: Route.MetaFunction = ({matches}) => {
    const brandName = getBrandNameFromMatches(matches);
    return (
        getSeoMeta({
            title: "Contact Us",
            description: `Get in touch with ${brandName}. Find our contact information, business hours, location, and social media links.`,
            url: buildCanonicalUrl("/contact")
        }) ?? []
    );
};

export default function Contact() {
    const contactInfo = useContactInfo();
    const socialLinks = useSocialLinks();
    return (
        <div className="min-h-dvh  ">
            {/* Hero Section - Cream Background
                 pt-(--page-breathing-room): Breathing room from fixed header (24px → 64px) */}
            <section className="bg-background pt-(--page-breathing-room) pb-12 sm:pb-16 md:pb-24 lg:pb-32">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div>
                        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16 items-end">
                            {/* Large Title */}
                            <div>
                                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium text-primary leading-none">
                                    Get in
                                    <br />
                                    Touch
                                </h1>
                            </div>

                            {/* Tagline */}
                            <div className="lg:pb-4">
                                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-md">
                                    We&apos;d love to hear from you. Whether you have a question about our products,
                                    need assistance, or just want to say hello.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Methods - Primary Background */}
            <section className="bg-primary py-12 sm:py-16 md:py-24">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div>
                        {/* Section Label */}
                        <p className="text-sm sm:text-sm uppercase tracking-widest text-primary-foreground/50 mb-8 sm:mb-12">
                            Reach Out
                        </p>

                        {/* Contact Cards Grid */}
                        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                            <ContactCard
                                label="Email"
                                value={contactInfo.email}
                                href={`mailto:${contactInfo.email}`}
                                delay={0}
                            />
                            <ContactCard
                                label="Phone"
                                value={contactInfo.phone}
                                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                                delay={1}
                            />
                            <ContactCard label="Hours" value={contactInfo.businessHours} delay={2} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Section - Primary Background */}
            <section className="bg-primary py-12 sm:py-16 md:py-24">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div>
                        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-24">
                            {/* Location Title */}
                            <div>
                                <p className="text-sm sm:text-sm uppercase tracking-widest text-primary-foreground/50 mb-3 sm:mb-4">
                                    Visit Us
                                </p>
                                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-primary-foreground leading-tight">
                                    Our
                                    <br />
                                    Location
                                </h2>
                            </div>

                            {/* Address */}
                            <div className="flex items-end">
                                <address className="not-italic">
                                    <p className="text-xl sm:text-2xl md:text-3xl text-primary-foreground leading-relaxed">
                                        {contactInfo.address.street}
                                        <br />
                                        {contactInfo.address.city}, {contactInfo.address.state}{" "}
                                        {contactInfo.address.zip}
                                        <br />
                                        <span className="text-primary-foreground/60">
                                            {contactInfo.address.country}
                                        </span>
                                    </p>
                                </address>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Section - Cream Background */}
            <section className="bg-background py-12 sm:py-16 md:py-24">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div>
                        {/* Section Label */}
                        <p className="text-sm sm:text-sm uppercase tracking-widest text-muted-foreground mb-6 sm:mb-8">
                            Follow Along
                        </p>

                        {/* Large Social Title */}
                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-primary mb-8 sm:mb-12 leading-tight">
                            Stay Connected
                        </h2>

                        {/* Social Links */}
                        <div className="space-y-3 sm:space-y-4">
                            {socialLinks.map((link, index) => (
                                <SocialLink
                                    key={link.id}
                                    title={link.platform}
                                    handle={link.handle}
                                    url={link.url}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

interface ContactCardProps {
    label: string;
    value: string;
    href?: string;
    delay: number;
}

function ContactCard({label, value, href}: ContactCardProps) {
    const content = (
        <div className="group relative overflow-hidden rounded-2xl bg-overlay-light p-5 sm:p-6 md:p-8 transition-all duration-300 hover:bg-overlay-light-hover min-h-[100px] sm:min-h-[120px]">
            {/* Arrow indicator for links */}
            {href && (
                <span className="absolute top-4 right-4 sm:top-6 sm:right-6 text-primary-foreground/40 transition-all duration-300 group-hover:text-primary-foreground group-hover:translate-x-1">
                    &rarr;
                </span>
            )}

            <span className="block text-sm sm:text-sm uppercase tracking-widest text-primary-foreground/50 mb-2 sm:mb-3">
                {label}
            </span>
            <span className="block font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary-foreground leading-tight wrap-break-word">
                {value}
            </span>
        </div>
    );

    if (href) {
        return (
            <a href={href} className="block animate-product-fade-in hover:no-underline">
                {content}
            </a>
        );
    }

    return <div className="animate-product-fade-in">{content}</div>;
}

interface SocialLinkProps {
    title: string;
    handle: string;
    url: string;
    index: number;
}

function SocialLink({title, handle, url}: SocialLinkProps) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between border-b border-border py-4 sm:py-6 transition-colors hover:border-primary hover:no-underline animate-product-fade-in min-h-[60px] sm:min-h-[72px]"
        >
            <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-2">
                    &rarr;
                </span>
                <span className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary transition-colors group-hover:text-primary/80">
                    {title}
                </span>
            </div>
            <span className="text-sm sm:text-base md:text-lg text-muted-foreground transition-colors group-hover:text-primary/80 hidden sm:block">
                {handle}
            </span>
        </a>
    );
}
