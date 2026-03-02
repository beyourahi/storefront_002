/**
 * @fileoverview Centralized Fallback Data for Storefront Configuration
 *
 * @description
 * Single source of truth for all default/fallback values used throughout the Hydrogen
 * storefront. These defaults are generic and suitable for any Shopify storefront,
 * regardless of product category or niche.
 *
 * @architecture
 * Fallback Strategy:
 * - Used when Shopify metaobjects (site_settings, theme_settings) are not configured
 * - Parsers in metaobject-parsers.ts reference these defaults
 * - Generic defaults ready for brand customization
 * - Complete data coverage: brand, content, SEO, contact, collections, theme
 *
 * Customization Workflow:
 * 1. Update BRAND section (name, words, mission) with your brand identity
 * 2. Update CONTACT section (email, phone, address)
 * 3. Update SEO section (site URL, default meta tags)
 * 4. Update SOCIAL section (Instagram, TikTok, Facebook handles)
 * 5. Update FAQ section with your specific policies
 * 6. Update SEARCH section (popular search terms)
 * 7. Deploy → Site works with generic defaults → Configure metaobjects later
 *
 * Data Categories:
 * - Brand Identity: Name, brand words, mission statement
 * - Hero Section: Headings, descriptions, CTAs
 * - SEO Defaults: Site URL, meta title/description
 * - Contact Info: Email, phone, business hours, address
 * - Section Headings: Blog, collections, related products
 * - Page Headings: Gallery, Blog
 * - Shipping: Free shipping threshold, currency code
 * - Social Links: Instagram, TikTok, Facebook
 * - FAQ Items: 14 generic shopping FAQs
 * - Testimonials: 6 international customer reviews
 * - Instagram Media: 8 placeholder images with generic alt text
 * - Search: Generic popular search terms
 * - Navigation: Collections, Blog
 * - Theme: Default fonts (Inter) and colors (monochrome)
 *
 * @dependencies
 * - TypeScript types from types/index.ts
 *
 * @related
 * - app/lib/metaobject-parsers.ts - Uses these as defaults when parsing metaobjects
 * - app/lib/site-content-context.tsx - Provides these via React Context
 * - app/root.tsx - Falls back to these when metaobject queries fail
 */

import type {
    SocialLink,
    ProductContent,
    CartContent,
    AccountContent,
    SearchContent,
    UIMessages,
    ErrorContent,
    WishlistContent
} from "types";

// =============================================================================
// BRAND IDENTITY
// =============================================================================

/**
 * Your brand name - appears in header, footer, meta tags, etc.
 */
export const FALLBACK_BRAND_NAME = "Your Store";

/**
 * Words that describe your brand - used in marquee animations
 */
export const FALLBACK_BRAND_WORDS: string[] = [
    "Quality",
    "Crafted",
    "Curated",
    "Timeless",
    "Refined",
    "Purposeful",
    "Distinct",
    "Essential",
    "Thoughtful",
    "Premium"
];

// =============================================================================
// HERO SECTION
// =============================================================================

/**
 * Hero heading - the first impression of the brand
 */
export const FALLBACK_HERO_HEADING = "Shop with Intention";

/**
 * Hero description - expands on the brand promise
 */
export const FALLBACK_HERO_DESCRIPTION =
    "Discover products built to last. Quality craftsmanship, thoughtful design, everyday value. Your next favorite find is here.";

// =============================================================================
// HERO CARD (REMOVED - Now hardcoded in VideoHero component)
// =============================================================================
// Hero card text and CTA were removed from metaobjects as the hero card now
// dynamically showcases random collections. The text is hardcoded in the
// VideoHero component for consistency.

// =============================================================================
// HERO MEDIA CONFIGURATION
// =============================================================================

/**
 * Default hero media type when no metaobject is configured
 * Determines whether the VideoHero renders a video or image background
 */
export const FALLBACK_HERO_MEDIA_CONFIG: {type: "video" | "image"; videoSrc?: string; imageSrc?: string} = {
    type: "video",
    videoSrc: "/hero-video.mp4"
};

// =============================================================================
// SEO DEFAULTS
// =============================================================================

export const FALLBACK_SITE_URL = "https://example.com";

/**
 * The suffix used when building page titles with brand name
 * e.g., "Your Store | Quality Products"
 */
export const FALLBACK_SEO_TITLE_SUFFIX = "Quality Products";

export const FALLBACK_SEO_TITLE = `${FALLBACK_BRAND_NAME} | ${FALLBACK_SEO_TITLE_SUFFIX}`;

/**
 * Default SEO meta description - appears in search results
 */
export const FALLBACK_SEO_DESCRIPTION =
    "Quality products curated for the discerning shopper. Find items built to last, designed with purpose, and selected for their exceptional value.";

// =============================================================================
// SECTION HEADINGS
// =============================================================================

/**
 * Section headings used throughout the storefront
 */
export const FALLBACK_SECTION_HEADINGS = {
    blogSectionTitle: "From the Blog",
    collectionsTitle: "Featured Collections",
    relatedProductsTitle: "You Might Also Like",
    recommendedTitle: "Recommended For You",
    instagramTitle: "Follow Us"
};

// =============================================================================
// PAGE HEADINGS (Gallery & Blog)
// =============================================================================

/**
 * Gallery page heading and description
 * These appear on the /gallery route
 */
export const FALLBACK_GALLERY_PAGE_HEADING = "The Gallery";
export const FALLBACK_GALLERY_PAGE_DESCRIPTION =
    "A visual showcase of our products and the stories behind them—craftsmanship, process, and everyday use.";

/**
 * Blog page heading and description
 * These appear on the /blogs route
 */
export const FALLBACK_BLOG_PAGE_HEADING = "The Blog";
export const FALLBACK_BLOG_PAGE_DESCRIPTION =
    "Ideas, guides, and stories from our world—exploring craft, design, and the things worth owning.";

// =============================================================================
// SHIPPING CONFIGURATION
// =============================================================================

/**
 * Free shipping threshold in smallest currency unit (cents)
 * Example: 5000 = $50.00 or ৳5000
 */
export const FALLBACK_FREE_SHIPPING_THRESHOLD = 5000;

/**
 * Default currency code for the store
 */
export const FALLBACK_CURRENCY_CODE = "USD";

// =============================================================================
// SOCIAL LINKS
// =============================================================================

/**
 * Social links - platform presence for the brand
 */
export const FALLBACK_SOCIAL_LINKS: SocialLink[] = [
    {
        id: "social-instagram",
        platform: "Instagram",
        handle: "@yourstore",
        url: "https://instagram.com/yourstore",
        displayOrder: 1
    },
    {
        id: "social-tiktok",
        platform: "TikTok",
        handle: "@yourstore",
        url: "https://tiktok.com/@yourstore",
        displayOrder: 2
    },
    {
        id: "social-facebook",
        platform: "Facebook",
        handle: "/yourstore",
        url: "https://facebook.com/yourstore",
        displayOrder: 3
    }
];

// =============================================================================
// SEARCH
// =============================================================================

/**
 * Popular search terms shown when search is empty
 */
export const FALLBACK_POPULAR_SEARCHES = [
    "new arrivals",
    "best sellers",
    "gift ideas",
    "on sale",
    "trending now"
];

// =============================================================================
// NAVIGATION
// =============================================================================

/**
 * Fallback header menu when Shopify menu is unavailable
 * This provides basic navigation structure
 */
export const FALLBACK_HEADER_MENU = {
    id: "fallback-menu",
    items: [
        {
            id: "menu-collections",
            resourceId: null,
            tags: [],
            title: "Collections",
            type: "HTTP",
            url: "/collections",
            items: []
        },
        {
            id: "menu-blog",
            resourceId: null,
            tags: [],
            title: "Blog",
            type: "HTTP",
            url: "/blogs",
            items: []
        }
    ]
};

// =============================================================================
// THEME CUSTOMIZATION
// =============================================================================

/**
 * Default font configuration
 * All fonts use Inter for a clean, neutral base
 * Brands can override via theme_settings metaobject
 */
export const FALLBACK_THEME_FONTS = {
    sans: "Inter",
    serif: "Inter",
    mono: "Inter"
};

/**
 * Default core colors (OKLCH format)
 * Monochromatic black/white palette - neutral base for any brand
 * All colors have chroma=0 (achromatic) for pure grayscale
 *
 * WCAG 2.1 Level AA Compliance Verified:
 * ─────────────────────────────────────────────────────────────────────
 * | Pair                           | Contrast | WCAG Level | Status  |
 * |--------------------------------|----------|------------|---------|
 * | foreground on background       | 21.00:1  | AAA        | ✓ Pass  |
 * | primary-foreground on primary  | 14.68:1  | AAA        | ✓ Pass  |
 * | secondary-foreground on secondary | 15.42:1 | AAA     | ✓ Pass  |
 * | accent-foreground on accent    | 5.74:1   | AA         | ✓ Pass  |
 * ─────────────────────────────────────────────────────────────────────
 *
 * OKLCH to HEX Reference:
 * - primary: oklch(0.2 0 0) → #1f1f1f
 * - secondary: oklch(0.9 0 0) → #e2e2e2
 * - background: oklch(1 0 0) → #ffffff
 * - foreground: oklch(0.15 0 0) → #000000 (clips)
 * - accent: oklch(0.45 0 0) → #616161
 */
export const FALLBACK_THEME_COLORS = {
    primary: "oklch(0.2 0 0)", // Near black - primary actions
    secondary: "oklch(0.9 0 0)", // Light gray - borders, secondary
    background: "oklch(1 0 0)", // Pure white
    foreground: "oklch(0.15 0 0)", // Near black - text
    accent: "oklch(0.45 0 0)" // Medium gray - accents, hovers
};

/**
 * Combined theme fallback
 */
export const FALLBACK_THEME = {
    fonts: FALLBACK_THEME_FONTS,
    colors: FALLBACK_THEME_COLORS
};

// =============================================================================
// COMBINED SITE SETTINGS EXPORT
// =============================================================================

/**
 * Combined fallback site settings object
 * This structure matches the SiteSettings type from metaobject-parsers.ts
 */
export const FALLBACK_SITE_SETTINGS = {
    // Brand Identity
    brandName: "",
    brandWords: FALLBACK_BRAND_WORDS,
    missionStatement: "",

    // Hero Section
    heroHeading: FALLBACK_HERO_HEADING,
    heroDescription: FALLBACK_HERO_DESCRIPTION,
    heroMediaMobile: undefined,
    heroMediaLargeScreen: undefined,

    // SEO Defaults
    siteUrl: "",
    defaultSeoTitle: "",
    defaultSeoDescription: "",

    // Contact Information
    contactEmail: "",
    contactPhone: "",
    businessHours: "",
    address: {street: "", city: "", state: "", zip: "", country: ""},

    // Section Headings
    ...FALLBACK_SECTION_HEADINGS,

    // Page Headings (Gallery & Blog)
    galleryPageHeading: FALLBACK_GALLERY_PAGE_HEADING,
    galleryPageDescription: FALLBACK_GALLERY_PAGE_DESCRIPTION,
    blogPageHeading: FALLBACK_BLOG_PAGE_HEADING,
    blogPageDescription: FALLBACK_BLOG_PAGE_DESCRIPTION,

    // Promotional Banners
    announcementBanner: [],
    promotionalBannerOneMedia: undefined,
    promotionalBannerTwoMedia: undefined,

    // Shipping
    freeShippingThreshold: null,

    // Collections
    socialLinks: [],
    testimonials: [],
    faqItems: [],
    instagramMedia: [],

    // Favicon (null = use static fallback from assets)
    faviconUrl: null,

    // PWA Icons (null = not configured, PWA will not be installable)
    icon192Url: null,
    icon512Url: null,
    icon180AppleUrl: null
};

// =============================================================================
// PRODUCT PAGE CONTENT FALLBACKS
// =============================================================================

/**
 * Fallback values for product page UI elements
 *
 * @description
 * Default text for product page buttons, badges, stock messages, and tabs.
 * Used when product_page_content metaobject is not configured in Shopify.
 * Template placeholders: {quantity} for dynamic stock count, {percent} for discounts
 */
export const FALLBACK_PRODUCT_CONTENT: ProductContent = {
    // Add to Cart Button States
    addToCartStandard: "Add to Bag",
    addToCartPreorder: "Pre-Order",
    addToCartSoldOut: "Sold Out",
    addToCartSubscribe: "Subscribe",
    addToCartOffline: "Unavailable Offline",
    offlineHelperText: "Connect to the internet to add items to your bag",
    selectFrequency: "Select delivery frequency",

    // Stock Status Labels
    stockInStock: "In Stock",
    stockOutOfStock: "Out of Stock",
    stockLowTemplate: "Only {quantity} left",

    // Purchase Type Options
    purchaseTypeLabel: "Purchase Type",
    oneTimeLabel: "One-time purchase",
    subscribeSaveLabel: "Subscribe & Save",
    savePercentageTemplate: "Save {percent}%",

    // Product Page UI
    sizeGuideCta: "Size Guide",
    quantityLabel: "Quantity",

    // Product Tabs
    tabDescription: "Description",
    tabShipping: "Shipping",
    tabReviews: "Reviews",

    // Product Badges
    badgeNew: "New",
    badgeSale: "Sale",
    badgeBestseller: "Bestseller",
    badgeClearance: "Clearance",
    badgePremium: "Premium",
    badgePreorder: "Pre-Order",
    badgeLimited: "Limited Edition",

    // Wishlist & Share
    shareButtonLabel: "Share",
    wishlistAddLabel: "Add to wishlist",
    wishlistRemoveLabel: "Remove from wishlist",

    // Related Products
    relatedProductsTitle: "You might also like"
};

// =============================================================================
// CART & CHECKOUT CONTENT FALLBACKS
// =============================================================================

/**
 * Fallback values for cart drawer, cart page, and checkout flow
 *
 * @description
 * Default text for cart UI, empty states, summaries, and shipping progress.
 * Template placeholders: {amount} for currency values
 */
export const FALLBACK_CART_CONTENT: CartContent = {
    // Cart Headers
    cartDrawerTitle: "Your Bag",
    cartPageTitle: "Shopping Bag",
    itemCountSingular: "item",
    itemCountPlural: "items",

    // Empty Cart State
    emptyCartHeading: "Your bag is empty",
    emptyCartCta: "Continue Shopping",

    // Line Item Controls
    quantityLabel: "Quantity",
    removeLabel: "Remove",

    // Cart Summary Labels
    subtotalLabel: "Subtotal",
    shippingLabel: "Shipping",
    taxLabel: "Tax",
    totalLabel: "Total",
    taxShippingNotice: "Taxes and shipping calculated at checkout",

    // Discount Code
    discountPlaceholder: "Enter discount code",
    discountApplyButton: "Apply",
    discountApplied: "Discount applied",
    discountError: "Invalid discount code",

    // Free Shipping Progress
    freeShippingLabel: "Free Shipping",
    freeShippingUnlocked: "You've unlocked free shipping!",
    freeShippingAwayTemplate: "{amount} away from free shipping",
    freeShippingAlmost: "You're almost there!",
    freeShippingCalculating: "Calculating...",

    // Order Notes & Checkout
    orderNotesPlaceholder: "Add a note to your order",
    checkoutButton: "Checkout",
    checkoutCalculating: "Calculating...",
    checkoutOfflineWarning: "Connect to the internet to checkout",
    storeCreditNotice: "Store credit will be applied at checkout",

    // UI Controls
    closeButton: "Close",
    suggestionsTitle: "Complete your look"
};

// =============================================================================
// ACCOUNT & AUTH CONTENT FALLBACKS
// =============================================================================

/**
 * Fallback values for account dashboard, profile, orders, and authentication
 *
 * @description
 * Default text for account pages including time-based greetings.
 * Template placeholder: {name} for customer's first name
 */
export const FALLBACK_ACCOUNT_CONTENT: AccountContent = {
    // Time-based Greetings (use {name} placeholder)
    greetingMorning: "Good morning, {name}",
    greetingMidday: "Good day, {name}",
    greetingAfternoon: "Good afternoon, {name}",
    greetingEvening: "Good evening, {name}",
    greetingNight: "Good night, {name}",
    greetingFallback: "Welcome back",

    // Dashboard Section Headings
    sectionRecentOrders: "Recent Orders",
    sectionQuickActions: "Quick Actions",
    sectionAccountStats: "Account Overview",
    sectionRecentlyViewed: "Recently Viewed",

    // Quick Action Labels
    actionTrackOrders: "Track Orders",
    actionShopNow: "Shop Now",
    actionAddresses: "Addresses",
    actionGetHelp: "Get Help",
    actionEditProfile: "Edit Profile",
    actionOrderHistory: "Order History",

    // Account Statistics Labels
    statOrdersPlaced: "Orders Placed",
    statSavedAddresses: "Saved Addresses",
    statMemberSince: "Member Since",

    // Empty States
    emptyNoOrdersHeading: "No orders yet",
    emptyNoOrdersMessage: "When you place an order, it will appear here",
    emptyNoAddresses: "No saved addresses yet",

    // Navigation Menu
    navDashboard: "Dashboard",
    navOrders: "Orders",
    navReturns: "Returns",
    navWishlist: "Wishlist",
    navAccountDetails: "Account Details",

    // Form Buttons
    logoutButton: "Sign Out",
    saveButton: "Save Changes",
    cancelButton: "Cancel",
    viewAllOrders: "View All Orders",

    // Store Credit
    storeCreditLabel: "Store Credit",
    storeCreditAvailable: "Available Credit"
};

// =============================================================================
// SEARCH & FILTER CONTENT FALLBACKS
// =============================================================================

/**
 * Fallback values for search modal, filters, and sort options
 *
 * @description
 * Default text for search interface and collection filtering.
 * Template placeholders: {term} for search query, {count}/{total} for results
 */
export const FALLBACK_SEARCH_CONTENT: SearchContent = {
    // Search Input
    searchPlaceholder: "Search products...",

    // Search Sections
    recentSearchesHeading: "Recent Searches",
    popularSearchesHeading: "Popular Searches",
    featuredCollectionsHeading: "Featured Collections",
    clearAllButton: "Clear All",

    // Search Results
    emptyResultsHeading: "No results found",
    emptyResultsMessageTemplate: 'We couldn\'t find anything for "{term}"',
    viewAllResults: "View All Results",

    // Category Tabs
    categoryProducts: "Products",
    categoryCollections: "Collections",
    categoryArticles: "Articles",

    // Sort Options
    sortFeatured: "Featured",
    sortPriceLowHigh: "Price: Low to High",
    sortPriceHighLow: "Price: High to Low",
    sortNewest: "Newest",
    sortBestSelling: "Best Selling",
    sortAToZ: "A to Z",
    sortZToA: "Z to A",

    // Filter Labels
    filterByPrice: "Price",
    filterByColor: "Color",
    filterBySize: "Size",
    filterAvailability: "Availability",
    filterInStock: "In Stock",

    // Results Display
    resultsCountTemplate: "Showing {count} of {total} products",
    loadMoreButton: "Load More",
    loadingText: "Loading...",

    // View Options
    gridViewLabel: "Grid view",
    listViewLabel: "List view",
    col2Label: "2 columns",
    col3Label: "3 columns",
    col4Label: "4 columns",

    // Filter Buttons
    applyFilters: "Apply Filters",
    clearFilters: "Clear Filters"
};

// =============================================================================
// UI MESSAGES & NOTIFICATIONS FALLBACKS
// =============================================================================

/**
 * Fallback values for toast notifications, loading states, and status messages
 *
 * @description
 * Default text for system feedback and user notifications across the app
 * Template placeholders: {count} for quantities
 */
export const FALLBACK_UI_MESSAGES: UIMessages = {
    // Success Messages
    successGeneric: "Success!",
    successCartAdd: "Added to bag",
    successCartRemove: "Item removed",
    successWishlistAdd: "Added to wishlist",
    successWishlistRemove: "Removed from wishlist",
    successWishlistCleared: "Wishlist cleared",
    successSaved: "Changes saved",
    successLinkCopied: "Link copied!",
    successDiscount: "Discount applied",
    successSubscribed: "Thanks for subscribing!",

    // Error Messages
    errorGeneric: "Something went wrong. Please try again.",
    errorNetwork: "Please check your connection and try again",
    errorSession: "Your session has expired. Please sign in again.",
    errorRequired: "This field is required",
    errorInvalidEmail: "Please enter a valid email address",
    errorCopyFailed: "Couldn't copy to clipboard",

    // Loading States
    loadingGeneric: "Loading...",
    loadingProcessing: "Processing...",
    loadingCalculating: "Calculating...",
    loadingSaving: "Saving...",
    loadingAdding: "Adding...",

    // Form Validation
    validationPasswordShort: "Password must be at least 8 characters",
    validationPasswordMismatch: "Passwords don't match",
    validationEmailRequired: "Email is required",

    // Network Status
    statusOnline: "You're back online",
    statusOffline: "You're offline",

    // Cart Notifications
    cartItemsRemain: "items remain in your bag",
    cartQuantityUpdated: "Quantity updated",
    cartAllItemsAddedTemplate: "{count} items added to bag",
    cartSomeUnavailable: "Some items are no longer available"
};

// =============================================================================
// ERROR PAGES CONTENT FALLBACKS
// =============================================================================

/**
 * Fallback values for 404, 500, offline, and maintenance pages
 *
 * @description
 * Default text for error states and service interruptions
 */
export const FALLBACK_ERROR_CONTENT: ErrorContent = {
    // 404 Not Found
    notFoundHeading: "Page Not Found",
    notFoundMessage: "The page you're looking for doesn't exist or has been moved.",
    notFoundPrimaryCta: "Back to Home",
    notFoundSecondaryCta: "Browse Collections",

    // 500 Server Error
    serverErrorHeading: "Something Went Wrong",
    serverErrorMessage: "We're experiencing technical difficulties. Please try again.",
    serverErrorRetry: "Try Again",
    serverErrorHome: "Return Home",
    serverErrorContactPrefix: "Need help?",
    serverErrorContactLink: "Contact Support",

    // Offline Page
    offlineHeading: "You're Offline",
    offlineMessage: "Please check your internet connection and try again.",
    offlineRetry: "Retry",
    offlineHome: "Return Home",
    offlineTip: "Tip: Some pages you've visited before may still be available",

    // Maintenance Mode
    maintenanceHeading: "We'll Be Right Back",
    maintenanceMessage: "We're making some improvements. Please check back soon.",
    maintenanceEstimated: "Estimated time: a few minutes"
};

// =============================================================================
// WISHLIST CONTENT FALLBACKS
// =============================================================================

/**
 * Fallback values for wishlist page, sharing, and empty states
 *
 * @description
 * Default text for wishlist functionality including social sharing
 * Template placeholders: {count}, {brand}
 */
export const FALLBACK_WISHLIST_CONTENT: WishlistContent = {
    // Page Header
    pageHeading: "Wishlist",
    metaDescription: "Your curated collection of favorite items",

    // Item Count Display
    itemCountLoading: "Loading...",
    itemCountEmpty: "No items saved",
    itemCountSingularTemplate: "{count} item you've saved",
    itemCountPluralTemplate: "{count} items you've saved",

    // Empty State
    emptyHeading: "Your wishlist is empty",
    emptyMessage: "Save your favorite pieces by tapping the heart icon",
    emptyCta: "Explore Collection",

    // Sort Options
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortPriceUp: "Price: Low to High",
    sortPriceDown: "Price: High to Low",
    listLabel: "List",

    // Action Buttons
    shareButton: "Share",
    addAllButton: "Add All to Bag",
    clearButton: "Clear All",

    // Share Dialog
    shareDialogHeading: "Share Your Wishlist",
    shareCopyLink: "Copy Link",
    shareCopied: "Link copied!",
    shareDescriptionTemplate: "Check out my wishlist with {count} items from {brand}",

    // Clear Confirmation Dialog
    clearDialogTitle: "Clear Wishlist",
    clearDialogMessageTemplate: "Are you sure you want to remove all {count} items?",
    clearDialogWarning: "This action cannot be undone",
    clearDialogKeep: "Keep Items",
    clearDialogConfirm: "Clear All",

    // Bulk Add Feedback
    addAllSuccessTemplate: "{count} items added to bag",

    // Unavailable Products
    unavailableHeading: "Some items are unavailable",
    unavailableMessage: "These items are currently out of stock or discontinued",
    clearUnavailableButton: "Remove Unavailable",
    browseProductsButton: "Browse Products",

    // Shared Wishlist Page
    sharedWishlistBadge: "Shared",
    sharedWishlistEmpty: "This shared wishlist is empty",
    myWishlistTitle: "My Wishlist",
    curatedItemsTemplate: "{count} curated items"
};

// ============================================================
// COMMERCE MOCK DATA
// Full Shopify-shaped catalog mock (24 products, 6 collections)
// Activated via USE_MOCK_DATA=true env var
// ============================================================

/**
 * @fileoverview Mock Data Layer — No-Shopify Deployment Mode
 *
 * @description
 * Drop-in data source for Hydrogen storefronts deployed without a Shopify backend.
 * Mirrors the exact field shapes returned by the Storefront API so components can
 * consume mock data with zero conditional logic.
 * Resolved centrally by `app/lib/data-source.ts` through the DataAdapter.
 *
 * @source
 * Products parsed from a Shopify CSV export. Images placed in public/images/products/.
 * To add your own images: copy them to public/images/products/ and update the
 * handle_to_img_prefix mapping at the top of this file.
 *
 * @image-setup
 * Run once after cloning: cp ~/Desktop/images/* public/images/products/
 * Or update IMG_BASE to point wherever you host the images.
 *
 * @exports
 * getMockProductByHandle(handle)       — PDP route
 * getMockAllProducts()                 — All products list / all-products collection
 * getMockFeaturedProducts(count?)      — Homepage featured grid
 * getMockCollections()                 — Collections listing page
 * getMockCollectionByHandle(handle)    — Collection page route
 * getMockProductsByCollection(handle)  — Products within a collection
 * getMockCuratedCollectionTabs()       — Homepage CuratedCollections component
 * getMockCollectionsWithCounts()       — CollectionSidebar on PDP / collection pages
 * getMockTotalProductCount()           — "All Products" sidebar count
 * getMockDiscountedProductCount()      — "Sale" sidebar badge count
 */

// =============================================================================
// TYPE ALIASES
//
// Field names mirror storefrontapi.generated.d.ts so existing components work
// unchanged. Only fields actually consumed by the app are declared here;
// PRODUCT_FRAGMENT and ProductItemFragment are both satisfied by MockProduct.
// =============================================================================

export interface MockMoney {
    amount: string;
    currencyCode: string;
}

export interface MockImage {
    id: string;
    url: string;
    altText: string | null;
    width: number;
    height: number;
}

export interface MockSelectedOption {
    name: string;
    value: string;
}

export interface MockVariant {
    id: string;
    title: string;
    sku: string;
    availableForSale: boolean;
    quantityAvailable: number;
    price: MockMoney;
    compareAtPrice: MockMoney | null;
    selectedOptions: MockSelectedOption[];
    image: MockImage;
    /** Back-reference required by ProductForm and cart line rendering */
    product: { title: string; handle: string };
    /** Selling plans are not supported in mock mode */
    sellingPlanAllocations: { nodes: [] };
    unitPrice: null;
}

export interface MockProductOption {
    name: string;
    optionValues: Array<{
        name: string;
        /** Always null in mock mode — variant pre-selection handled by first variant */
        firstSelectableVariant: MockVariant | null;
        swatch: null;
    }>;
}

/**
 * Full product shape — satisfies both PRODUCT_FRAGMENT (PDP) and
 * ProductItemFragment (collection/search cards) since the latter is a subset.
 */
export interface MockProduct {
    id: string;
    title: string;
    handle: string;
    vendor: string;
    description: string;
    descriptionHtml: string;
    tags: string[];
    availableForSale: boolean;
    /** Shopify-encoded bitfield — set to empty string in mock mode */
    encodedVariantExistence: string;
    encodedVariantAvailability: string;
    sizeChart: null;
    collections: { nodes: Array<{ handle: string; title: string }> };
    images: { nodes: MockImage[] };
    /** Only MediaImage nodes — no Video nodes in mock data */
    media: { nodes: Array<{ __typename: "MediaImage"; id: string; alt: string | null; image: MockImage }> };
    variants: { nodes: MockVariant[] };
    options: MockProductOption[];
    selectedOrFirstAvailableVariant: MockVariant | null;
    adjacentVariants: MockVariant[];
    priceRange: { minVariantPrice: MockMoney; maxVariantPrice: MockMoney };
    compareAtPriceRange: { minVariantPrice: MockMoney };
    featuredImage: MockImage | null;
    seo: { title: string; description: string };
    requiresSellingPlan: false;
    sellingPlanGroups: { nodes: [] };
}

export interface MockCollection {
    id: string;
    handle: string;
    title: string;
    description: string;
    seo: { title: string; description: string };
    image: MockImage | null;
    products: {
        nodes: MockProduct[];
        pageInfo: {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
            endCursor: string | null;
        };
    };
}

/** Shape expected by CollectionSidebar and sidebar query helpers */
export interface MockCollectionWithCount {
    handle: string;
    title: string;
    productsCount: number;
}

/** Shape expected by the CuratedCollections homepage component */
export interface MockCuratedTab {
    title: string;
    handle: string;
    products: MockProduct[];
}

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/**
 * Base path for product images.
 * Files must exist at: public/images/products/<filename>
 * Update this constant if you serve images from a CDN or different directory.
 */
const IMG_BASE = "/images/products" as const;

function money(amount: string, currencyCode = "USD"): MockMoney {
    return {amount, currencyCode};
}

function img(id: string, url: string, alt: string, w = 800, h = 800): MockImage {
    return {id, url, altText: alt, width: w, height: h};
}

// =============================================================================
// PRODUCT CATALOG
//
// 24 products derived from the Shopify CSV export.
// Each product includes full variant data with options, pricing, and inventory.
//
// To customise for a new niche:
//   1. Replace descriptionHtml / description with brand-appropriate copy
//   2. Update title, vendor, tags to match your brand
//   3. Swap image files in public/images/products/
//   4. Adjust pricing in price fields
// =============================================================================

const MOCK_PRODUCTS: MockProduct[] = [
    {
        id: "gid://shopify/Product/charm-bracelet",
        handle: "charm-bracelet",
        title: "Charm Bracelet + Jewelry",
        vendor: "horcrux-demo-store",
        description: "Add a touch of magic to your ensemble with the Charm Bracelet, adorned with iconic symbols from the wizarding world. Whether worn alone or layered with other pieces, this bracelet is a charming accessory for any Harry Potter enthusiast.\nTechnical Details:\n\n\nMaterial: Sterling silver\n\nCharms: Various charms including the Hogwarts crest, lightning bolt, and golden snitch\n\nLength: Adjustable chain with lobster clasp closure\n\nPackaging: Comes in a decorative jewelry box",
        descriptionHtml: `<p>Add a touch of magic to your ensemble with the Charm Bracelet, adorned with iconic symbols from the wizarding world. Whether worn alone or layered with other pieces, this bracelet is a charming accessory for any Harry Potter enthusiast.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Sterling silver</li>
<li>
<strong>Charms:</strong> Various charms including the Hogwarts crest, lightning bolt, and golden snitch</li>
<li>
<strong>Length:</strong> Adjustable chain with lobster clasp closure</li>
<li>
<strong>Packaging:</strong> Comes in a decorative jewelry box</li>
</ul>
<!---->`,
        tags: ["preorder"],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Charm Bracelet + Jewelry", description: ""},
        collections: {nodes: [{handle: "jewelry", title: "Jewelry"}]},
        featuredImage: img("charm-bracelet-img-1", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Charm Bracelet + Jewelry"),
        images: {nodes: [
            img("charm-bracelet-img-1", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Charm Bracelet + Jewelry"),
            img("charm-bracelet-img-2", `${IMG_BASE}/charm_bracelet_jewelry_2.avif`, "Charm Bracelet + Jewelry"),
            img("charm-bracelet-img-3", `${IMG_BASE}/charm_bracelet_jewelry_3.avif`, "Charm Bracelet + Jewelry"),
            img("charm-bracelet-img-4", `${IMG_BASE}/charm_bracelet_jewelry_4.avif`, "Charm Bracelet + Jewelry"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "charm-bracelet-media-1", alt: "Charm Bracelet + Jewelry", image: img("charm-bracelet-img-1", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Charm Bracelet + Jewelry")},
            {__typename: "MediaImage" as const, id: "charm-bracelet-media-2", alt: "Charm Bracelet + Jewelry", image: img("charm-bracelet-img-2", `${IMG_BASE}/charm_bracelet_jewelry_2.avif`, "Charm Bracelet + Jewelry")},
            {__typename: "MediaImage" as const, id: "charm-bracelet-media-3", alt: "Charm Bracelet + Jewelry", image: img("charm-bracelet-img-3", `${IMG_BASE}/charm_bracelet_jewelry_3.avif`, "Charm Bracelet + Jewelry")},
            {__typename: "MediaImage" as const, id: "charm-bracelet-media-4", alt: "Charm Bracelet + Jewelry", image: img("charm-bracelet-img-4", `${IMG_BASE}/charm_bracelet_jewelry_4.avif`, "Charm Bracelet + Jewelry")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("69.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/charm-bracelet-v1",
                title: "Polished",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Finish", value: "Polished"}],
                image: img("charm-bracelet-img-1", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Charm Bracelet + Jewelry"),
                product: {title: "Charm Bracelet + Jewelry", handle: "charm-bracelet"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/charm-bracelet-v2",
                title: "Matte",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Finish", value: "Matte"}],
                image: img("charm-bracelet-img-1", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Charm Bracelet + Jewelry"),
                product: {title: "Charm Bracelet + Jewelry", handle: "charm-bracelet"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/charm-bracelet-v3",
                title: "Brushed",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Finish", value: "Brushed"}],
                image: img("charm-bracelet-img-1", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Charm Bracelet + Jewelry"),
                product: {title: "Charm Bracelet + Jewelry", handle: "charm-bracelet"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Finish",
                optionValues: [
                    {
                        name: "Polished",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/charm-bracelet-v1", title: "Polished", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Finish", value: "Polished"}],
                            image: img("charm-bracelet-img-1", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Charm Bracelet + Jewelry"),
                            product: {title: "Charm Bracelet + Jewelry", handle: "charm-bracelet"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Matte",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/charm-bracelet-v2", title: "Matte", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Finish", value: "Matte"}],
                            image: img("charm-bracelet-img-1", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Charm Bracelet + Jewelry"),
                            product: {title: "Charm Bracelet + Jewelry", handle: "charm-bracelet"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Brushed",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/charm-bracelet-v3", title: "Brushed", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Finish", value: "Brushed"}],
                            image: img("charm-bracelet-img-1", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Charm Bracelet + Jewelry"),
                            product: {title: "Charm Bracelet + Jewelry", handle: "charm-bracelet"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/charm-bracelet-v1", title: "Polished", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Finish", value: "Polished"}],
            image: img("charm-bracelet-img-1", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Charm Bracelet + Jewelry"),
            product: {title: "Charm Bracelet + Jewelry", handle: "charm-bracelet"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/house-crest-earrings",
        handle: "house-crest-earrings",
        title: "House Crest Earrings + Jewelry",
        vendor: "horcrux-demo-store",
        description: "Showcase your house pride with the House Crest Earrings, featuring the emblem of your chosen Hogwarts house. Elegant and understated, these earrings are perfect for adding a subtle touch of magic to any outfit.\nTechnical Details:\n\n\nMaterial: Hypoallergenic stainless steel\n\nDesign: House crest emblem with enamel detailing\n\nClosure: Stud back\n\nFinish: Polished silver tone\n\nPackaging: Comes in a decorative jewelry box",
        descriptionHtml: `<p>Showcase your house pride with the House Crest Earrings, featuring the emblem of your chosen Hogwarts house. Elegant and understated, these earrings are perfect for adding a subtle touch of magic to any outfit.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Hypoallergenic stainless steel</li>
<li>
<strong>Design:</strong> House crest emblem with enamel detailing</li>
<li>
<strong>Closure:</strong> Stud back</li>
<li>
<strong>Finish:</strong> Polished silver tone</li>
<li>
<strong>Packaging:</strong> Comes in a decorative jewelry box</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "House Crest Earrings + Jewelry", description: ""},
        collections: {nodes: [{handle: "jewelry", title: "Jewelry"}]},
        featuredImage: img("house-crest-earrings-img-1", `${IMG_BASE}/house_crest_earrings_jewelry_1.avif`, "House Crest Earrings + Jewelry"),
        images: {nodes: [
            img("house-crest-earrings-img-1", `${IMG_BASE}/house_crest_earrings_jewelry_1.avif`, "House Crest Earrings + Jewelry"),
            img("house-crest-earrings-img-2", `${IMG_BASE}/house_crest_earrings_jewelry_2.avif`, "House Crest Earrings + Jewelry"),
            img("house-crest-earrings-img-3", `${IMG_BASE}/house_crest_earrings_jewelry_3.avif`, "House Crest Earrings + Jewelry"),
            img("house-crest-earrings-img-4", `${IMG_BASE}/house_crest_earrings_jewelry_4.avif`, "House Crest Earrings + Jewelry"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "house-crest-earrings-media-1", alt: "House Crest Earrings + Jewelry", image: img("house-crest-earrings-img-1", `${IMG_BASE}/house_crest_earrings_jewelry_1.avif`, "House Crest Earrings + Jewelry")},
            {__typename: "MediaImage" as const, id: "house-crest-earrings-media-2", alt: "House Crest Earrings + Jewelry", image: img("house-crest-earrings-img-2", `${IMG_BASE}/house_crest_earrings_jewelry_2.avif`, "House Crest Earrings + Jewelry")},
            {__typename: "MediaImage" as const, id: "house-crest-earrings-media-3", alt: "House Crest Earrings + Jewelry", image: img("house-crest-earrings-img-3", `${IMG_BASE}/house_crest_earrings_jewelry_3.avif`, "House Crest Earrings + Jewelry")},
            {__typename: "MediaImage" as const, id: "house-crest-earrings-media-4", alt: "House Crest Earrings + Jewelry", image: img("house-crest-earrings-img-4", `${IMG_BASE}/house_crest_earrings_jewelry_4.avif`, "House Crest Earrings + Jewelry")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("420.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/house-crest-earrings-v1",
                title: "Polished",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Finish", value: "Polished"}],
                image: img("house-crest-earrings-img-1", `${IMG_BASE}/house_crest_earrings_jewelry_1.avif`, "House Crest Earrings + Jewelry"),
                product: {title: "House Crest Earrings + Jewelry", handle: "house-crest-earrings"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/house-crest-earrings-v2",
                title: "Matte",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Finish", value: "Matte"}],
                image: img("house-crest-earrings-img-1", `${IMG_BASE}/house_crest_earrings_jewelry_1.avif`, "House Crest Earrings + Jewelry"),
                product: {title: "House Crest Earrings + Jewelry", handle: "house-crest-earrings"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/house-crest-earrings-v3",
                title: "Brushed",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Finish", value: "Brushed"}],
                image: img("house-crest-earrings-img-1", `${IMG_BASE}/house_crest_earrings_jewelry_1.avif`, "House Crest Earrings + Jewelry"),
                product: {title: "House Crest Earrings + Jewelry", handle: "house-crest-earrings"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Finish",
                optionValues: [
                    {
                        name: "Polished",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/house-crest-earrings-v1", title: "Polished", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Finish", value: "Polished"}],
                            image: img("house-crest-earrings-img-1", `${IMG_BASE}/house_crest_earrings_jewelry_1.avif`, "House Crest Earrings + Jewelry"),
                            product: {title: "House Crest Earrings + Jewelry", handle: "house-crest-earrings"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Matte",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/house-crest-earrings-v2", title: "Matte", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: money("420.00"),
                            selectedOptions: [{name: "Finish", value: "Matte"}],
                            image: img("house-crest-earrings-img-1", `${IMG_BASE}/house_crest_earrings_jewelry_1.avif`, "House Crest Earrings + Jewelry"),
                            product: {title: "House Crest Earrings + Jewelry", handle: "house-crest-earrings"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Brushed",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/house-crest-earrings-v3", title: "Brushed", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Finish", value: "Brushed"}],
                            image: img("house-crest-earrings-img-1", `${IMG_BASE}/house_crest_earrings_jewelry_1.avif`, "House Crest Earrings + Jewelry"),
                            product: {title: "House Crest Earrings + Jewelry", handle: "house-crest-earrings"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/house-crest-earrings-v1", title: "Polished", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Finish", value: "Polished"}],
            image: img("house-crest-earrings-img-1", `${IMG_BASE}/house_crest_earrings_jewelry_1.avif`, "House Crest Earrings + Jewelry"),
            product: {title: "House Crest Earrings + Jewelry", handle: "house-crest-earrings"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/deathly-hallows-pendant",
        handle: "deathly-hallows-pendant",
        title: "Deathly Hallows Pendant + Jewelry",
        vendor: "horcrux-demo-store",
        description: "Embrace the power of the Deathly Hallows with this exquisite pendant, featuring the iconic symbol of the elder wand, resurrection stone, and invisibility cloak. Crafted with precision and attention to detail, this pendant is a must-have for any Harry Potter collector.\nTechnical Details:\n\n\nMaterial: Sterling silver\n\nSize: 1 inch in diameter\n\nChain: Adjustable chain with lobster clasp closure\n\nFinish: Polished silver tone\n\nPackaging: Comes in a decorative jewelry box",
        descriptionHtml: `<p>Embrace the power of the Deathly Hallows with this exquisite pendant, featuring the iconic symbol of the elder wand, resurrection stone, and invisibility cloak. Crafted with precision and attention to detail, this pendant is a must-have for any Harry Potter collector.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Sterling silver</li>
<li>
<strong>Size:</strong> 1 inch in diameter</li>
<li>
<strong>Chain:</strong> Adjustable chain with lobster clasp closure</li>
<li>
<strong>Finish:</strong> Polished silver tone</li>
<li>
<strong>Packaging:</strong> Comes in a decorative jewelry box</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Deathly Hallows Pendant + Jewelry", description: ""},
        collections: {nodes: [{handle: "jewelry", title: "Jewelry"}]},
        featuredImage: img("deathly-hallows-pendant-img-1", `${IMG_BASE}/deathly_hallows_pendant_jewelry_1.avif`, "Deathly Hallows Pendant + Jewelry"),
        images: {nodes: [
            img("deathly-hallows-pendant-img-1", `${IMG_BASE}/deathly_hallows_pendant_jewelry_1.avif`, "Deathly Hallows Pendant + Jewelry"),
            img("deathly-hallows-pendant-img-2", `${IMG_BASE}/deathly_hallows_pendant_jewelry_2.avif`, "Deathly Hallows Pendant + Jewelry"),
            img("deathly-hallows-pendant-img-3", `${IMG_BASE}/deathly_hallows_pendant_jewelry_3.avif`, "Deathly Hallows Pendant + Jewelry"),
            img("deathly-hallows-pendant-img-4", `${IMG_BASE}/deathly_hallows_pendant_jewelry_4.avif`, "Deathly Hallows Pendant + Jewelry"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "deathly-hallows-pendant-media-1", alt: "Deathly Hallows Pendant + Jewelry", image: img("deathly-hallows-pendant-img-1", `${IMG_BASE}/deathly_hallows_pendant_jewelry_1.avif`, "Deathly Hallows Pendant + Jewelry")},
            {__typename: "MediaImage" as const, id: "deathly-hallows-pendant-media-2", alt: "Deathly Hallows Pendant + Jewelry", image: img("deathly-hallows-pendant-img-2", `${IMG_BASE}/deathly_hallows_pendant_jewelry_2.avif`, "Deathly Hallows Pendant + Jewelry")},
            {__typename: "MediaImage" as const, id: "deathly-hallows-pendant-media-3", alt: "Deathly Hallows Pendant + Jewelry", image: img("deathly-hallows-pendant-img-3", `${IMG_BASE}/deathly_hallows_pendant_jewelry_3.avif`, "Deathly Hallows Pendant + Jewelry")},
            {__typename: "MediaImage" as const, id: "deathly-hallows-pendant-media-4", alt: "Deathly Hallows Pendant + Jewelry", image: img("deathly-hallows-pendant-img-4", `${IMG_BASE}/deathly_hallows_pendant_jewelry_4.avif`, "Deathly Hallows Pendant + Jewelry")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("69.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/deathly-hallows-pendant-v1",
                title: "Polished",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Finish", value: "Polished"}],
                image: img("deathly-hallows-pendant-img-1", `${IMG_BASE}/deathly_hallows_pendant_jewelry_1.avif`, "Deathly Hallows Pendant + Jewelry"),
                product: {title: "Deathly Hallows Pendant + Jewelry", handle: "deathly-hallows-pendant"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/deathly-hallows-pendant-v2",
                title: "Matte",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Finish", value: "Matte"}],
                image: img("deathly-hallows-pendant-img-1", `${IMG_BASE}/deathly_hallows_pendant_jewelry_1.avif`, "Deathly Hallows Pendant + Jewelry"),
                product: {title: "Deathly Hallows Pendant + Jewelry", handle: "deathly-hallows-pendant"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/deathly-hallows-pendant-v3",
                title: "Brushed",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Finish", value: "Brushed"}],
                image: img("deathly-hallows-pendant-img-1", `${IMG_BASE}/deathly_hallows_pendant_jewelry_1.avif`, "Deathly Hallows Pendant + Jewelry"),
                product: {title: "Deathly Hallows Pendant + Jewelry", handle: "deathly-hallows-pendant"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Finish",
                optionValues: [
                    {
                        name: "Polished",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/deathly-hallows-pendant-v1", title: "Polished", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Finish", value: "Polished"}],
                            image: img("deathly-hallows-pendant-img-1", `${IMG_BASE}/deathly_hallows_pendant_jewelry_1.avif`, "Deathly Hallows Pendant + Jewelry"),
                            product: {title: "Deathly Hallows Pendant + Jewelry", handle: "deathly-hallows-pendant"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Matte",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/deathly-hallows-pendant-v2", title: "Matte", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Finish", value: "Matte"}],
                            image: img("deathly-hallows-pendant-img-1", `${IMG_BASE}/deathly_hallows_pendant_jewelry_1.avif`, "Deathly Hallows Pendant + Jewelry"),
                            product: {title: "Deathly Hallows Pendant + Jewelry", handle: "deathly-hallows-pendant"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Brushed",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/deathly-hallows-pendant-v3", title: "Brushed", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Finish", value: "Brushed"}],
                            image: img("deathly-hallows-pendant-img-1", `${IMG_BASE}/deathly_hallows_pendant_jewelry_1.avif`, "Deathly Hallows Pendant + Jewelry"),
                            product: {title: "Deathly Hallows Pendant + Jewelry", handle: "deathly-hallows-pendant"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/deathly-hallows-pendant-v1", title: "Polished", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Finish", value: "Polished"}],
            image: img("deathly-hallows-pendant-img-1", `${IMG_BASE}/deathly_hallows_pendant_jewelry_1.avif`, "Deathly Hallows Pendant + Jewelry"),
            product: {title: "Deathly Hallows Pendant + Jewelry", handle: "deathly-hallows-pendant"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/time-turner-necklace",
        handle: "time-turner-necklace",
        title: "Time-Turner Necklace + Jewelry",
        vendor: "horcrux-demo-store",
        description: "Turn back time with the Time-Turner Necklace, inspired by Hermione Granger's magical time-travel device. Intricately designed and beautifully crafted, this necklace is a symbol of adventure and discovery, perfect for any Harry Potter fan with a love for the extraordinary.\nTechnical Details:\n\n\nMaterial: Gold-plated brass\n\nSize: 1.5 inches in diameter\n\nChain: Adjustable chain with lobster clasp closure\n\nFinish: Antique gold tone\n\nPackaging: Comes in a decorative jewelry box",
        descriptionHtml: `<p>Turn back time with the Time-Turner Necklace, inspired by Hermione Granger's magical time-travel device. Intricately designed and beautifully crafted, this necklace is a symbol of adventure and discovery, perfect for any Harry Potter fan with a love for the extraordinary.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Gold-plated brass</li>
<li>
<strong>Size:</strong> 1.5 inches in diameter</li>
<li>
<strong>Chain:</strong> Adjustable chain with lobster clasp closure</li>
<li>
<strong>Finish:</strong> Antique gold tone</li>
<li>
<strong>Packaging:</strong> Comes in a decorative jewelry box</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Time-Turner Necklace + Jewelry", description: ""},
        collections: {nodes: [{handle: "jewelry", title: "Jewelry"}]},
        featuredImage: img("time-turner-necklace-img-1", `${IMG_BASE}/time_turner_necklace_jewelry_1.avif`, "Time-Turner Necklace + Jewelry"),
        images: {nodes: [
            img("time-turner-necklace-img-1", `${IMG_BASE}/time_turner_necklace_jewelry_1.avif`, "Time-Turner Necklace + Jewelry"),
            img("time-turner-necklace-img-2", `${IMG_BASE}/time_turner_necklace_jewelry_2.avif`, "Time-Turner Necklace + Jewelry"),
            img("time-turner-necklace-img-3", `${IMG_BASE}/time_turner_necklace_jewelry_3.avif`, "Time-Turner Necklace + Jewelry"),
            img("time-turner-necklace-img-4", `${IMG_BASE}/time_turner_necklace_jewelry_4.avif`, "Time-Turner Necklace + Jewelry"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "time-turner-necklace-media-1", alt: "Time-Turner Necklace + Jewelry", image: img("time-turner-necklace-img-1", `${IMG_BASE}/time_turner_necklace_jewelry_1.avif`, "Time-Turner Necklace + Jewelry")},
            {__typename: "MediaImage" as const, id: "time-turner-necklace-media-2", alt: "Time-Turner Necklace + Jewelry", image: img("time-turner-necklace-img-2", `${IMG_BASE}/time_turner_necklace_jewelry_2.avif`, "Time-Turner Necklace + Jewelry")},
            {__typename: "MediaImage" as const, id: "time-turner-necklace-media-3", alt: "Time-Turner Necklace + Jewelry", image: img("time-turner-necklace-img-3", `${IMG_BASE}/time_turner_necklace_jewelry_3.avif`, "Time-Turner Necklace + Jewelry")},
            {__typename: "MediaImage" as const, id: "time-turner-necklace-media-4", alt: "Time-Turner Necklace + Jewelry", image: img("time-turner-necklace-img-4", `${IMG_BASE}/time_turner_necklace_jewelry_4.avif`, "Time-Turner Necklace + Jewelry")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("420.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/time-turner-necklace-v1",
                title: "Polished",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Finish", value: "Polished"}],
                image: img("time-turner-necklace-img-1", `${IMG_BASE}/time_turner_necklace_jewelry_1.avif`, "Time-Turner Necklace + Jewelry"),
                product: {title: "Time-Turner Necklace + Jewelry", handle: "time-turner-necklace"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/time-turner-necklace-v2",
                title: "Matte",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Finish", value: "Matte"}],
                image: img("time-turner-necklace-img-1", `${IMG_BASE}/time_turner_necklace_jewelry_1.avif`, "Time-Turner Necklace + Jewelry"),
                product: {title: "Time-Turner Necklace + Jewelry", handle: "time-turner-necklace"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/time-turner-necklace-v3",
                title: "Brushed",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Finish", value: "Brushed"}],
                image: img("time-turner-necklace-img-1", `${IMG_BASE}/time_turner_necklace_jewelry_1.avif`, "Time-Turner Necklace + Jewelry"),
                product: {title: "Time-Turner Necklace + Jewelry", handle: "time-turner-necklace"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Finish",
                optionValues: [
                    {
                        name: "Polished",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/time-turner-necklace-v1", title: "Polished", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Finish", value: "Polished"}],
                            image: img("time-turner-necklace-img-1", `${IMG_BASE}/time_turner_necklace_jewelry_1.avif`, "Time-Turner Necklace + Jewelry"),
                            product: {title: "Time-Turner Necklace + Jewelry", handle: "time-turner-necklace"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Matte",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/time-turner-necklace-v2", title: "Matte", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: money("420.00"),
                            selectedOptions: [{name: "Finish", value: "Matte"}],
                            image: img("time-turner-necklace-img-1", `${IMG_BASE}/time_turner_necklace_jewelry_1.avif`, "Time-Turner Necklace + Jewelry"),
                            product: {title: "Time-Turner Necklace + Jewelry", handle: "time-turner-necklace"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Brushed",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/time-turner-necklace-v3", title: "Brushed", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Finish", value: "Brushed"}],
                            image: img("time-turner-necklace-img-1", `${IMG_BASE}/time_turner_necklace_jewelry_1.avif`, "Time-Turner Necklace + Jewelry"),
                            product: {title: "Time-Turner Necklace + Jewelry", handle: "time-turner-necklace"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/time-turner-necklace-v1", title: "Polished", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Finish", value: "Polished"}],
            image: img("time-turner-necklace-img-1", `${IMG_BASE}/time_turner_necklace_jewelry_1.avif`, "Time-Turner Necklace + Jewelry"),
            product: {title: "Time-Turner Necklace + Jewelry", handle: "time-turner-necklace"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/hufflepuff-robe",
        handle: "hufflepuff-robe",
        title: "Hufflepuff Robe + Robes",
        vendor: "horcrux-demo-store",
        description: "Dress for success with the Hufflepuff Robe, crafted with the utmost attention to detail. Featuring the house colors and crest, this robe is perfect for any aspiring Hufflepuff, whether attending classes or participating in magical ceremonies.\nTechnical Details:\n\n\nMaterial: High-quality polyester fabric\n\nDesign: Full-length robe with hood\n\nClosure: Front button closure\n\nSizes: Available in various sizes for a perfect fit\n\nCare Instructions: Dry clean only",
        descriptionHtml: `<p>Dress for success with the Hufflepuff Robe, crafted with the utmost attention to detail. Featuring the house colors and crest, this robe is perfect for any aspiring Hufflepuff, whether attending classes or participating in magical ceremonies.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> High-quality polyester fabric</li>
<li>
<strong>Design:</strong> Full-length robe with hood</li>
<li>
<strong>Closure:</strong> Front button closure</li>
<li>
<strong>Sizes:</strong> Available in various sizes for a perfect fit</li>
<li>
<strong>Care Instructions:</strong> Dry clean only</li>
</ul>
<!---->`,
        tags: ["preorder", "Women"],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Hufflepuff Robe + Robes", description: ""},
        collections: {nodes: [{handle: "robes", title: "Robes"}]},
        featuredImage: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
        images: {nodes: [
            img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
            img("hufflepuff-robe-img-2", `${IMG_BASE}/hufflepuff_robe_robes_2.avif`, "Hufflepuff Robe + Robes"),
            img("hufflepuff-robe-img-3", `${IMG_BASE}/hufflepuff_robe_robes_3.avif`, "Hufflepuff Robe + Robes"),
            img("hufflepuff-robe-img-4", `${IMG_BASE}/hufflepuff_robe_robes_4.avif`, "Hufflepuff Robe + Robes"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "hufflepuff-robe-media-1", alt: "Hufflepuff Robe + Robes", image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes")},
            {__typename: "MediaImage" as const, id: "hufflepuff-robe-media-2", alt: "Hufflepuff Robe + Robes", image: img("hufflepuff-robe-img-2", `${IMG_BASE}/hufflepuff_robe_robes_2.avif`, "Hufflepuff Robe + Robes")},
            {__typename: "MediaImage" as const, id: "hufflepuff-robe-media-3", alt: "Hufflepuff Robe + Robes", image: img("hufflepuff-robe-img-3", `${IMG_BASE}/hufflepuff_robe_robes_3.avif`, "Hufflepuff Robe + Robes")},
            {__typename: "MediaImage" as const, id: "hufflepuff-robe-media-4", alt: "Hufflepuff Robe + Robes", image: img("hufflepuff-robe-img-4", `${IMG_BASE}/hufflepuff_robe_robes_4.avif`, "Hufflepuff Robe + Robes")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("69.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/hufflepuff-robe-v1",
                title: "XS",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "XS"}],
                image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/hufflepuff-robe-v2",
                title: "S",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "S"}],
                image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/hufflepuff-robe-v3",
                title: "M",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "M"}],
                image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/hufflepuff-robe-v4",
                title: "L",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "L"}],
                image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/hufflepuff-robe-v5",
                title: "XL",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "XL"}],
                image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/hufflepuff-robe-v6",
                title: "2XL",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "2XL"}],
                image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Size",
                optionValues: [
                    {
                        name: "XS",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hufflepuff-robe-v1", title: "XS", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "XS"}],
                            image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                            product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "S",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hufflepuff-robe-v2", title: "S", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "S"}],
                            image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                            product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "M",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hufflepuff-robe-v3", title: "M", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "M"}],
                            image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                            product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "L",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hufflepuff-robe-v4", title: "L", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "L"}],
                            image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                            product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "XL",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hufflepuff-robe-v5", title: "XL", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "XL"}],
                            image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                            product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "2XL",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hufflepuff-robe-v6", title: "2XL", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "2XL"}],
                            image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
                            product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/hufflepuff-robe-v1", title: "XS", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Size", value: "XS"}],
            image: img("hufflepuff-robe-img-1", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Hufflepuff Robe + Robes"),
            product: {title: "Hufflepuff Robe + Robes", handle: "hufflepuff-robe"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/ravenclaw-robe",
        handle: "ravenclaw-robe",
        title: "Ravenclaw Robe + Robes",
        vendor: "horcrux-demo-store",
        description: "Achieve academic excellence in style with the Ravenclaw Robe, a symbol of wisdom and creativity. With its intricate design and Ravenclaw crest, this robe is perfect for any Ravenclaw student ready to embark on their magical journey.\nTechnical Details:\n\n\nMaterial: High-quality polyester fabric\n\nDesign: Full-length robe with hood\n\nClosure: Front button closure\n\nSizes: Available in various sizes for a perfect fit\n\nCare Instructions: Dry clean only",
        descriptionHtml: `<p>Achieve academic excellence in style with the Ravenclaw Robe, a symbol of wisdom and creativity. With its intricate design and Ravenclaw crest, this robe is perfect for any Ravenclaw student ready to embark on their magical journey.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> High-quality polyester fabric</li>
<li>
<strong>Design:</strong> Full-length robe with hood</li>
<li>
<strong>Closure:</strong> Front button closure</li>
<li>
<strong>Sizes:</strong> Available in various sizes for a perfect fit</li>
<li>
<strong>Care Instructions:</strong> Dry clean only</li>
</ul>
<!---->`,
        tags: ["Unisex"],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Ravenclaw Robe + Robes", description: ""},
        collections: {nodes: [{handle: "robes", title: "Robes"}]},
        featuredImage: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
        images: {nodes: [
            img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
            img("ravenclaw-robe-img-2", `${IMG_BASE}/ravenclaw_robe_robes_2.avif`, "Ravenclaw Robe + Robes"),
            img("ravenclaw-robe-img-3", `${IMG_BASE}/ravenclaw_robe_robes_3.avif`, "Ravenclaw Robe + Robes"),
            img("ravenclaw-robe-img-4", `${IMG_BASE}/ravenclaw_robe_robes_4.avif`, "Ravenclaw Robe + Robes"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "ravenclaw-robe-media-1", alt: "Ravenclaw Robe + Robes", image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes")},
            {__typename: "MediaImage" as const, id: "ravenclaw-robe-media-2", alt: "Ravenclaw Robe + Robes", image: img("ravenclaw-robe-img-2", `${IMG_BASE}/ravenclaw_robe_robes_2.avif`, "Ravenclaw Robe + Robes")},
            {__typename: "MediaImage" as const, id: "ravenclaw-robe-media-3", alt: "Ravenclaw Robe + Robes", image: img("ravenclaw-robe-img-3", `${IMG_BASE}/ravenclaw_robe_robes_3.avif`, "Ravenclaw Robe + Robes")},
            {__typename: "MediaImage" as const, id: "ravenclaw-robe-media-4", alt: "Ravenclaw Robe + Robes", image: img("ravenclaw-robe-img-4", `${IMG_BASE}/ravenclaw_robe_robes_4.avif`, "Ravenclaw Robe + Robes")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("420.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/ravenclaw-robe-v1",
                title: "XS",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "XS"}],
                image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/ravenclaw-robe-v2",
                title: "S",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Size", value: "S"}],
                image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/ravenclaw-robe-v3",
                title: "M",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "M"}],
                image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/ravenclaw-robe-v4",
                title: "L",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "L"}],
                image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/ravenclaw-robe-v5",
                title: "XL",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "XL"}],
                image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/ravenclaw-robe-v6",
                title: "2XL",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "2XL"}],
                image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Size",
                optionValues: [
                    {
                        name: "XS",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/ravenclaw-robe-v1", title: "XS", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "XS"}],
                            image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                            product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "S",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/ravenclaw-robe-v2", title: "S", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: money("420.00"),
                            selectedOptions: [{name: "Size", value: "S"}],
                            image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                            product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "M",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/ravenclaw-robe-v3", title: "M", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "M"}],
                            image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                            product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "L",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/ravenclaw-robe-v4", title: "L", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "L"}],
                            image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                            product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "XL",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/ravenclaw-robe-v5", title: "XL", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "XL"}],
                            image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                            product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "2XL",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/ravenclaw-robe-v6", title: "2XL", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "2XL"}],
                            image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
                            product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/ravenclaw-robe-v1", title: "XS", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Size", value: "XS"}],
            image: img("ravenclaw-robe-img-1", `${IMG_BASE}/ravenclaw_robe_robes_1.avif`, "Ravenclaw Robe + Robes"),
            product: {title: "Ravenclaw Robe + Robes", handle: "ravenclaw-robe"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/slytherin-robe",
        handle: "slytherin-robe",
        title: "Slytherin Robe + Robes",
        vendor: "horcrux-demo-store",
        description: "Embrace ambition and cunning with the Slytherin Robe, crafted for those destined for greatness. Featuring the house colors and crest, this robe exudes sophistication and power, making it the perfect attire for any Slytherin student.\nTechnical Details:\n\n\nMaterial: High-quality polyester fabric\n\nDesign: Full-length robe with hood\n\nClosure: Front button closure\n\nSizes: Available in various sizes for a perfect fit\n\nCare Instructions: Dry clean only",
        descriptionHtml: `<p>Embrace ambition and cunning with the Slytherin Robe, crafted for those destined for greatness. Featuring the house colors and crest, this robe exudes sophistication and power, making it the perfect attire for any Slytherin student.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> High-quality polyester fabric</li>
<li>
<strong>Design:</strong> Full-length robe with hood</li>
<li>
<strong>Closure:</strong> Front button closure</li>
<li>
<strong>Sizes:</strong> Available in various sizes for a perfect fit</li>
<li>
<strong>Care Instructions:</strong> Dry clean only</li>
</ul>
<!---->`,
        tags: ["Men"],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Slytherin Robe + Robes", description: ""},
        collections: {nodes: [{handle: "robes", title: "Robes"}]},
        featuredImage: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
        images: {nodes: [
            img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
            img("slytherin-robe-img-2", `${IMG_BASE}/slytherin_robe_robes_2.avif`, "Slytherin Robe + Robes"),
            img("slytherin-robe-img-3", `${IMG_BASE}/slytherin_robe_robes_3.avif`, "Slytherin Robe + Robes"),
            img("slytherin-robe-img-4", `${IMG_BASE}/slytherin_robe_robes_4.avif`, "Slytherin Robe + Robes"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "slytherin-robe-media-1", alt: "Slytherin Robe + Robes", image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes")},
            {__typename: "MediaImage" as const, id: "slytherin-robe-media-2", alt: "Slytherin Robe + Robes", image: img("slytherin-robe-img-2", `${IMG_BASE}/slytherin_robe_robes_2.avif`, "Slytherin Robe + Robes")},
            {__typename: "MediaImage" as const, id: "slytherin-robe-media-3", alt: "Slytherin Robe + Robes", image: img("slytherin-robe-img-3", `${IMG_BASE}/slytherin_robe_robes_3.avif`, "Slytherin Robe + Robes")},
            {__typename: "MediaImage" as const, id: "slytherin-robe-media-4", alt: "Slytherin Robe + Robes", image: img("slytherin-robe-img-4", `${IMG_BASE}/slytherin_robe_robes_4.avif`, "Slytherin Robe + Robes")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("69.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/slytherin-robe-v1",
                title: "XS",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "XS"}],
                image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/slytherin-robe-v2",
                title: "S",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "S"}],
                image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/slytherin-robe-v3",
                title: "M",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "M"}],
                image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/slytherin-robe-v4",
                title: "L",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "L"}],
                image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/slytherin-robe-v5",
                title: "XL",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "XL"}],
                image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/slytherin-robe-v6",
                title: "2XL",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "2XL"}],
                image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Size",
                optionValues: [
                    {
                        name: "XS",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/slytherin-robe-v1", title: "XS", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "XS"}],
                            image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                            product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "S",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/slytherin-robe-v2", title: "S", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "S"}],
                            image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                            product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "M",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/slytherin-robe-v3", title: "M", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "M"}],
                            image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                            product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "L",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/slytherin-robe-v4", title: "L", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "L"}],
                            image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                            product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "XL",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/slytherin-robe-v5", title: "XL", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "XL"}],
                            image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                            product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "2XL",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/slytherin-robe-v6", title: "2XL", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "2XL"}],
                            image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
                            product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/slytherin-robe-v1", title: "XS", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Size", value: "XS"}],
            image: img("slytherin-robe-img-1", `${IMG_BASE}/slytherin_robe_robes_1.avif`, "Slytherin Robe + Robes"),
            product: {title: "Slytherin Robe + Robes", handle: "slytherin-robe"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/gryffindor-robe",
        handle: "gryffindor-robe",
        title: "Gryffindor Robe + Robes",
        vendor: "horcrux-demo-store",
        description: "Step into the bravery and courage of Gryffindor with the Gryffindor Robe, a symbol of honor and heroism. With its bold design and Gryffindor crest, this robe is perfect for any Gryffindor student ready to embark on their magical adventures.\nTechnical Details:\n\n\nMaterial: High-quality polyester fabric\n\nDesign: Full-length robe with hood\n\nClosure: Front button closure\n\nSizes: Available in various sizes for a perfect fit\n\nCare Instructions: Dry clean only",
        descriptionHtml: `<p>Step into the bravery and courage of Gryffindor with the Gryffindor Robe, a symbol of honor and heroism. With its bold design and Gryffindor crest, this robe is perfect for any Gryffindor student ready to embark on their magical adventures.</p>
<h4><strong>Technical Details:</strong></h4>
<ul>
<li>
<strong>Material:</strong> High-quality polyester fabric</li>
<li>
<strong>Design:</strong> Full-length robe with hood</li>
<li>
<strong>Closure:</strong> Front button closure</li>
<li>
<strong>Sizes:</strong> Available in various sizes for a perfect fit</li>
<li>
<strong>Care Instructions:</strong> Dry clean only</li>
</ul>
<!---->`,
        tags: ["Men", "Unisex"],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Gryffindor Robe + Robes", description: "Step into the bravery and courage of Gryffindor with the Gryffindor Robe, a symbol of honor and heroism. With its bold design and Gryffindor crest, this robe is perfect for any Gryffindor student ready to embark on their magical adventures."},
        collections: {nodes: [{handle: "robes", title: "Robes"}]},
        featuredImage: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
        images: {nodes: [
            img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
            img("gryffindor-robe-img-2", `${IMG_BASE}/gryffindor_robe_robes_2.avif`, "Gryffindor Robe + Robes"),
            img("gryffindor-robe-img-3", `${IMG_BASE}/gryffindor_robe_robes_3.avif`, "Gryffindor Robe + Robes"),
            img("gryffindor-robe-img-4", `${IMG_BASE}/gryffindor_robe_robes_4.avif`, "Gryffindor Robe + Robes"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "gryffindor-robe-media-1", alt: "Gryffindor Robe + Robes", image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes")},
            {__typename: "MediaImage" as const, id: "gryffindor-robe-media-2", alt: "Gryffindor Robe + Robes", image: img("gryffindor-robe-img-2", `${IMG_BASE}/gryffindor_robe_robes_2.avif`, "Gryffindor Robe + Robes")},
            {__typename: "MediaImage" as const, id: "gryffindor-robe-media-3", alt: "Gryffindor Robe + Robes", image: img("gryffindor-robe-img-3", `${IMG_BASE}/gryffindor_robe_robes_3.avif`, "Gryffindor Robe + Robes")},
            {__typename: "MediaImage" as const, id: "gryffindor-robe-media-4", alt: "Gryffindor Robe + Robes", image: img("gryffindor-robe-img-4", `${IMG_BASE}/gryffindor_robe_robes_4.avif`, "Gryffindor Robe + Robes")},
        ]},
        priceRange: {minVariantPrice: money("69.66"), maxVariantPrice: money("100.69")},
        compareAtPriceRange: {minVariantPrice: money("420.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/gryffindor-robe-v1",
                title: "Small / Black",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.66"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "Small"}, {name: "Color", value: "Black"}],
                image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/gryffindor-robe-v2",
                title: "Small / White",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.66"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Size", value: "Small"}, {name: "Color", value: "White"}],
                image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/gryffindor-robe-v3",
                title: "Small / Zinc",
                sku: "",
                availableForSale: true,
                quantityAvailable: 148,
                price: money("69.66"),
                compareAtPrice: null,
                selectedOptions: [{name: "Size", value: "Small"}, {name: "Color", value: "Zinc"}],
                image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/gryffindor-robe-v4",
                title: "Medium / Black",
                sku: "",
                availableForSale: true,
                quantityAvailable: 100,
                price: money("80.69"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Size", value: "Medium"}, {name: "Color", value: "Black"}],
                image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/gryffindor-robe-v5",
                title: "Medium / White",
                sku: "",
                availableForSale: true,
                quantityAvailable: 100,
                price: money("80.69"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Size", value: "Medium"}, {name: "Color", value: "White"}],
                image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/gryffindor-robe-v6",
                title: "Medium / Zinc",
                sku: "",
                availableForSale: true,
                quantityAvailable: 150,
                price: money("80.69"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Size", value: "Medium"}, {name: "Color", value: "Zinc"}],
                image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/gryffindor-robe-v7",
                title: "Large / Black",
                sku: "",
                availableForSale: true,
                quantityAvailable: 100,
                price: money("100.69"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Size", value: "Large"}, {name: "Color", value: "Black"}],
                image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/gryffindor-robe-v8",
                title: "Large / White",
                sku: "",
                availableForSale: true,
                quantityAvailable: 100,
                price: money("100.69"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Size", value: "Large"}, {name: "Color", value: "White"}],
                image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/gryffindor-robe-v9",
                title: "Large / Zinc",
                sku: "",
                availableForSale: true,
                quantityAvailable: 90,
                price: money("100.69"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Size", value: "Large"}, {name: "Color", value: "Zinc"}],
                image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Size",
                optionValues: [
                    {
                        name: "Small",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/gryffindor-robe-v1", title: "Small / Black", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.66"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "Small"}, {name: "Color", value: "Black"}],
                            image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                            product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Medium",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/gryffindor-robe-v4", title: "Medium / Black", sku: "",
                            availableForSale: true, quantityAvailable: 100,
                            price: money("80.69"), compareAtPrice: money("420.00"),
                            selectedOptions: [{name: "Size", value: "Medium"}, {name: "Color", value: "Black"}],
                            image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                            product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Large",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/gryffindor-robe-v7", title: "Large / Black", sku: "",
                            availableForSale: true, quantityAvailable: 100,
                            price: money("100.69"), compareAtPrice: money("420.00"),
                            selectedOptions: [{name: "Size", value: "Large"}, {name: "Color", value: "Black"}],
                            image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                            product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
            {
                name: "Color",
                optionValues: [
                    {
                        name: "Black",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/gryffindor-robe-v1", title: "Small / Black", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.66"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "Small"}, {name: "Color", value: "Black"}],
                            image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                            product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "White",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/gryffindor-robe-v2", title: "Small / White", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.66"), compareAtPrice: money("420.00"),
                            selectedOptions: [{name: "Size", value: "Small"}, {name: "Color", value: "White"}],
                            image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                            product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "Zinc",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/gryffindor-robe-v3", title: "Small / Zinc", sku: "",
                            availableForSale: true, quantityAvailable: 148,
                            price: money("69.66"), compareAtPrice: null,
                            selectedOptions: [{name: "Size", value: "Small"}, {name: "Color", value: "Zinc"}],
                            image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
                            product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/gryffindor-robe-v1", title: "Small / Black", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.66"), compareAtPrice: null,
            selectedOptions: [{name: "Size", value: "Small"}, {name: "Color", value: "Black"}],
            image: img("gryffindor-robe-img-1", `${IMG_BASE}/gryffindor_robe_robes_1.avif`, "Gryffindor Robe + Robes"),
            product: {title: "Gryffindor Robe + Robes", handle: "gryffindor-robe"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/spell-engraved-pencils",
        handle: "spell-engraved-pencils",
        title: "Spell-Engraved Pencils + Magical Stationery",
        vendor: "horcrux-demo-store",
        description: "Add a touch of magic to your writing with Spell-Engraved Pencils, each pencil featuring an engraved spell from the wizarding world. These high-quality pencils are perfect for any Harry Potter fan looking to make their notes a little more enchanting.\nTechnical Details:\n\n\nMaterial: High-quality wood\n\nLength: Standard pencil length\n\nEngraving: Various spell names such as \"Lumos\" and \"Alohomora\"\n\nLead Type: HB\n\nPackaging: Comes in a decorative box",
        descriptionHtml: `<p>Add a touch of magic to your writing with Spell-Engraved Pencils, each pencil featuring an engraved spell from the wizarding world. These high-quality pencils are perfect for any Harry Potter fan looking to make their notes a little more enchanting.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> High-quality wood</li>
<li>
<strong>Length:</strong> Standard pencil length</li>
<li>
<strong>Engraving:</strong> Various spell names such as "Lumos" and "Alohomora"</li>
<li>
<strong>Lead Type:</strong> HB</li>
<li>
<strong>Packaging:</strong> Comes in a decorative box</li>
</ul>
<!---->`,
        tags: ["preorder"],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Spell-Engraved Pencils + Magical Stationery", description: ""},
        collections: {nodes: [{handle: "magical-stationery", title: "Magical Stationery"}]},
        featuredImage: img("spell-engraved-pencils-img-1", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_1.avif`, "Spell-Engraved Pencils + Magical Stationery"),
        images: {nodes: [
            img("spell-engraved-pencils-img-1", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_1.avif`, "Spell-Engraved Pencils + Magical Stationery"),
            img("spell-engraved-pencils-img-2", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_2.avif`, "Spell-Engraved Pencils + Magical Stationery"),
            img("spell-engraved-pencils-img-3", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_3.avif`, "Spell-Engraved Pencils + Magical Stationery"),
            img("spell-engraved-pencils-img-4", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_4.avif`, "Spell-Engraved Pencils + Magical Stationery"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "spell-engraved-pencils-media-1", alt: "Spell-Engraved Pencils + Magical Stationery", image: img("spell-engraved-pencils-img-1", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_1.avif`, "Spell-Engraved Pencils + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "spell-engraved-pencils-media-2", alt: "Spell-Engraved Pencils + Magical Stationery", image: img("spell-engraved-pencils-img-2", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_2.avif`, "Spell-Engraved Pencils + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "spell-engraved-pencils-media-3", alt: "Spell-Engraved Pencils + Magical Stationery", image: img("spell-engraved-pencils-img-3", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_3.avif`, "Spell-Engraved Pencils + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "spell-engraved-pencils-media-4", alt: "Spell-Engraved Pencils + Magical Stationery", image: img("spell-engraved-pencils-img-4", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_4.avif`, "Spell-Engraved Pencils + Magical Stationery")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("420.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/spell-engraved-pencils-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 83,
                price: money("69.00"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("spell-engraved-pencils-img-1", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_1.avif`, "Spell-Engraved Pencils + Magical Stationery"),
                product: {title: "Spell-Engraved Pencils + Magical Stationery", handle: "spell-engraved-pencils"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/spell-engraved-pencils-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 83,
                            price: money("69.00"), compareAtPrice: money("420.00"),
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("spell-engraved-pencils-img-1", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_1.avif`, "Spell-Engraved Pencils + Magical Stationery"),
                            product: {title: "Spell-Engraved Pencils + Magical Stationery", handle: "spell-engraved-pencils"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/spell-engraved-pencils-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 83,
            price: money("69.00"), compareAtPrice: money("420.00"),
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("spell-engraved-pencils-img-1", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_1.avif`, "Spell-Engraved Pencils + Magical Stationery"),
            product: {title: "Spell-Engraved Pencils + Magical Stationery", handle: "spell-engraved-pencils"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/house-themed-pen-set",
        handle: "house-themed-pen-set",
        title: "House-Themed Pen Set + Magical Stationery",
        vendor: "horcrux-demo-store",
        description: "Show your house pride with the House-Themed Pen Set, featuring pens designed in the colors and crests of the four Hogwarts houses. Perfect for writing letters or taking notes, these pens are a stylish and practical addition to any fan's collection.\nTechnical Details:\n\n\nMaterial: Plastic with metal accents\n\nInk Color: Black\n\nDesign: Each pen features a different house crest and colors\n\nPackaging: Comes in a set of four with a decorative box",
        descriptionHtml: `<p>Show your house pride with the House-Themed Pen Set, featuring pens designed in the colors and crests of the four Hogwarts houses. Perfect for writing letters or taking notes, these pens are a stylish and practical addition to any fan's collection.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Plastic with metal accents</li>
<li>
<strong>Ink Color:</strong> Black</li>
<li>
<strong>Design:</strong> Each pen features a different house crest and colors</li>
<li>
<strong>Packaging:</strong> Comes in a set of four with a decorative box</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "House-Themed Pen Set + Magical Stationery", description: ""},
        collections: {nodes: [{handle: "magical-stationery", title: "Magical Stationery"}]},
        featuredImage: img("house-themed-pen-set-img-1", `${IMG_BASE}/house_themed_pen_set_magical_stationery_1.avif`, "House-Themed Pen Set + Magical Stationery"),
        images: {nodes: [
            img("house-themed-pen-set-img-1", `${IMG_BASE}/house_themed_pen_set_magical_stationery_1.avif`, "House-Themed Pen Set + Magical Stationery"),
            img("house-themed-pen-set-img-2", `${IMG_BASE}/house_themed_pen_set_magical_stationery_2.avif`, "House-Themed Pen Set + Magical Stationery"),
            img("house-themed-pen-set-img-3", `${IMG_BASE}/house_themed_pen_set_magical_stationery_3.avif`, "House-Themed Pen Set + Magical Stationery"),
            img("house-themed-pen-set-img-4", `${IMG_BASE}/house_themed_pen_set_magical_stationery_4.avif`, "House-Themed Pen Set + Magical Stationery"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "house-themed-pen-set-media-1", alt: "House-Themed Pen Set + Magical Stationery", image: img("house-themed-pen-set-img-1", `${IMG_BASE}/house_themed_pen_set_magical_stationery_1.avif`, "House-Themed Pen Set + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "house-themed-pen-set-media-2", alt: "House-Themed Pen Set + Magical Stationery", image: img("house-themed-pen-set-img-2", `${IMG_BASE}/house_themed_pen_set_magical_stationery_2.avif`, "House-Themed Pen Set + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "house-themed-pen-set-media-3", alt: "House-Themed Pen Set + Magical Stationery", image: img("house-themed-pen-set-img-3", `${IMG_BASE}/house_themed_pen_set_magical_stationery_3.avif`, "House-Themed Pen Set + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "house-themed-pen-set-media-4", alt: "House-Themed Pen Set + Magical Stationery", image: img("house-themed-pen-set-img-4", `${IMG_BASE}/house_themed_pen_set_magical_stationery_4.avif`, "House-Themed Pen Set + Magical Stationery")},
        ]},
        priceRange: {minVariantPrice: money("0.0"), maxVariantPrice: money("0.0")},
        compareAtPriceRange: {minVariantPrice: money("0.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/house-themed-pen-set-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 66,
                price: money("0.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("house-themed-pen-set-img-1", `${IMG_BASE}/house_themed_pen_set_magical_stationery_1.avif`, "House-Themed Pen Set + Magical Stationery"),
                product: {title: "House-Themed Pen Set + Magical Stationery", handle: "house-themed-pen-set"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/house-themed-pen-set-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 66,
                            price: money("0.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("house-themed-pen-set-img-1", `${IMG_BASE}/house_themed_pen_set_magical_stationery_1.avif`, "House-Themed Pen Set + Magical Stationery"),
                            product: {title: "House-Themed Pen Set + Magical Stationery", handle: "house-themed-pen-set"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/house-themed-pen-set-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 66,
            price: money("0.00"), compareAtPrice: null,
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("house-themed-pen-set-img-1", `${IMG_BASE}/house_themed_pen_set_magical_stationery_1.avif`, "House-Themed Pen Set + Magical Stationery"),
            product: {title: "House-Themed Pen Set + Magical Stationery", handle: "house-themed-pen-set"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/hogwarts-crest-notebook",
        handle: "hogwarts-crest-notebook",
        title: "Hogwarts Crest Notebook + Magical Stationery",
        vendor: "horcrux-demo-store",
        description: "Show your Hogwarts pride with the Hogwarts Crest Notebook. This elegant and durable notebook is perfect for jotting down notes, sketches, and magical ideas.\nTechnical Details:\n\n\nCover Material: Hardbound with faux-leather finish\n\nDimensions: 8.5 x 5.5 inches\n\nPages: 200 ruled pages, acid-free\n\nDesign: Embossed Hogwarts crest on the cover\n\nExtras: Ribbon bookmark, expandable inner pocket",
        descriptionHtml: `<p>Show your Hogwarts pride with the Hogwarts Crest Notebook. This elegant and durable notebook is perfect for jotting down notes, sketches, and magical ideas.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Cover Material:</strong> Hardbound with faux-leather finish</li>
<li>
<strong>Dimensions:</strong> 8.5 x 5.5 inches</li>
<li>
<strong>Pages:</strong> 200 ruled pages, acid-free</li>
<li>
<strong>Design:</strong> Embossed Hogwarts crest on the cover</li>
<li>
<strong>Extras:</strong> Ribbon bookmark, expandable inner pocket</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Hogwarts Crest Notebook + Magical Stationery", description: ""},
        collections: {nodes: [{handle: "magical-stationery", title: "Magical Stationery"}]},
        featuredImage: img("hogwarts-crest-notebook-img-1", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_1.avif`, "Hogwarts Crest Notebook + Magical Stationery"),
        images: {nodes: [
            img("hogwarts-crest-notebook-img-1", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_1.avif`, "Hogwarts Crest Notebook + Magical Stationery"),
            img("hogwarts-crest-notebook-img-2", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_2.avif`, "Hogwarts Crest Notebook + Magical Stationery"),
            img("hogwarts-crest-notebook-img-3", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_3.avif`, "Hogwarts Crest Notebook + Magical Stationery"),
            img("hogwarts-crest-notebook-img-4", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_4.avif`, "Hogwarts Crest Notebook + Magical Stationery"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "hogwarts-crest-notebook-media-1", alt: "Hogwarts Crest Notebook + Magical Stationery", image: img("hogwarts-crest-notebook-img-1", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_1.avif`, "Hogwarts Crest Notebook + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "hogwarts-crest-notebook-media-2", alt: "Hogwarts Crest Notebook + Magical Stationery", image: img("hogwarts-crest-notebook-img-2", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_2.avif`, "Hogwarts Crest Notebook + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "hogwarts-crest-notebook-media-3", alt: "Hogwarts Crest Notebook + Magical Stationery", image: img("hogwarts-crest-notebook-img-3", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_3.avif`, "Hogwarts Crest Notebook + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "hogwarts-crest-notebook-media-4", alt: "Hogwarts Crest Notebook + Magical Stationery", image: img("hogwarts-crest-notebook-img-4", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_4.avif`, "Hogwarts Crest Notebook + Magical Stationery")},
        ]},
        priceRange: {minVariantPrice: money("0.0"), maxVariantPrice: money("0.0")},
        compareAtPriceRange: {minVariantPrice: money("0.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/hogwarts-crest-notebook-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 146,
                price: money("0.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("hogwarts-crest-notebook-img-1", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_1.avif`, "Hogwarts Crest Notebook + Magical Stationery"),
                product: {title: "Hogwarts Crest Notebook + Magical Stationery", handle: "hogwarts-crest-notebook"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hogwarts-crest-notebook-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 146,
                            price: money("0.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("hogwarts-crest-notebook-img-1", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_1.avif`, "Hogwarts Crest Notebook + Magical Stationery"),
                            product: {title: "Hogwarts Crest Notebook + Magical Stationery", handle: "hogwarts-crest-notebook"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/hogwarts-crest-notebook-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 146,
            price: money("0.00"), compareAtPrice: null,
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("hogwarts-crest-notebook-img-1", `${IMG_BASE}/hogwarts_crest_notebook_magical_stationery_1.avif`, "Hogwarts Crest Notebook + Magical Stationery"),
            product: {title: "Hogwarts Crest Notebook + Magical Stationery", handle: "hogwarts-crest-notebook"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/marauder-s-map-journal",
        handle: "marauder-s-map-journal",
        title: "Marauder\u2019s Map Journal + Magical Stationery",
        vendor: "horcrux-demo-store",
        description: "Capture your mischief and magical adventures with the Marauder\u2019s Map Journal. Inspired by the enchanted map, this beautifully designed journal is perfect for any Harry Potter fan.\nTechnical Details:\n\n\nCover Material: Hardbound with faux-leather finish\n\nDimensions: 8.5 x 5.5 inches\n\nPages: 200 ruled pages, acid-free\n\nDesign: Printed Marauder's Map design on the cover\n\nExtras: Ribbon bookmark, expandable inner pocket",
        descriptionHtml: `<p>Capture your mischief and magical adventures with the Marauder’s Map Journal. Inspired by the enchanted map, this beautifully designed journal is perfect for any Harry Potter fan.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Cover Material:</strong> Hardbound with faux-leather finish</li>
<li>
<strong>Dimensions:</strong> 8.5 x 5.5 inches</li>
<li>
<strong>Pages:</strong> 200 ruled pages, acid-free</li>
<li>
<strong>Design:</strong> Printed Marauder's Map design on the cover</li>
<li>
<strong>Extras:</strong> Ribbon bookmark, expandable inner pocket</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Marauder\u2019s Map Journal + Magical Stationery", description: ""},
        collections: {nodes: [{handle: "magical-stationery", title: "Magical Stationery"}]},
        featuredImage: img("marauder-s-map-journal-img-1", `${IMG_BASE}/marauders_map_journal_magical_stationery_1.avif`, "Marauder\u2019s Map Journal + Magical Stationery"),
        images: {nodes: [
            img("marauder-s-map-journal-img-1", `${IMG_BASE}/marauders_map_journal_magical_stationery_1.avif`, "Marauder\u2019s Map Journal + Magical Stationery"),
            img("marauder-s-map-journal-img-2", `${IMG_BASE}/marauders_map_journal_magical_stationery_2.avif`, "Marauder\u2019s Map Journal + Magical Stationery"),
            img("marauder-s-map-journal-img-3", `${IMG_BASE}/marauders_map_journal_magical_stationery_3.avif`, "Marauder\u2019s Map Journal + Magical Stationery"),
            img("marauder-s-map-journal-img-4", `${IMG_BASE}/marauders_map_journal_magical_stationery_4.avif`, "Marauder\u2019s Map Journal + Magical Stationery"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "marauder-s-map-journal-media-1", alt: "Marauder\u2019s Map Journal + Magical Stationery", image: img("marauder-s-map-journal-img-1", `${IMG_BASE}/marauders_map_journal_magical_stationery_1.avif`, "Marauder\u2019s Map Journal + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "marauder-s-map-journal-media-2", alt: "Marauder\u2019s Map Journal + Magical Stationery", image: img("marauder-s-map-journal-img-2", `${IMG_BASE}/marauders_map_journal_magical_stationery_2.avif`, "Marauder\u2019s Map Journal + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "marauder-s-map-journal-media-3", alt: "Marauder\u2019s Map Journal + Magical Stationery", image: img("marauder-s-map-journal-img-3", `${IMG_BASE}/marauders_map_journal_magical_stationery_3.avif`, "Marauder\u2019s Map Journal + Magical Stationery")},
            {__typename: "MediaImage" as const, id: "marauder-s-map-journal-media-4", alt: "Marauder\u2019s Map Journal + Magical Stationery", image: img("marauder-s-map-journal-img-4", `${IMG_BASE}/marauders_map_journal_magical_stationery_4.avif`, "Marauder\u2019s Map Journal + Magical Stationery")},
        ]},
        priceRange: {minVariantPrice: money("0.0"), maxVariantPrice: money("0.0")},
        compareAtPriceRange: {minVariantPrice: money("0.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/marauder-s-map-journal-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 54,
                price: money("0.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("marauder-s-map-journal-img-1", `${IMG_BASE}/marauders_map_journal_magical_stationery_1.avif`, "Marauder\u2019s Map Journal + Magical Stationery"),
                product: {title: "Marauder\u2019s Map Journal + Magical Stationery", handle: "marauder-s-map-journal"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/marauder-s-map-journal-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 54,
                            price: money("0.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("marauder-s-map-journal-img-1", `${IMG_BASE}/marauders_map_journal_magical_stationery_1.avif`, "Marauder\u2019s Map Journal + Magical Stationery"),
                            product: {title: "Marauder\u2019s Map Journal + Magical Stationery", handle: "marauder-s-map-journal"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/marauder-s-map-journal-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 54,
            price: money("0.00"), compareAtPrice: null,
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("marauder-s-map-journal-img-1", `${IMG_BASE}/marauders_map_journal_magical_stationery_1.avif`, "Marauder\u2019s Map Journal + Magical Stationery"),
            product: {title: "Marauder\u2019s Map Journal + Magical Stationery", handle: "marauder-s-map-journal"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/hogwarts-a-history",
        handle: "hogwarts-a-history",
        title: "Hogwarts: A History + Library Collection",
        vendor: "horcrux-demo-store",
        description: "Discover the rich history of Hogwarts School of Witchcraft and Wizardry with \"Hogwarts: A History,\" an essential read for any Harry Potter fan. This beautifully bound book is filled with fascinating tales and secrets of the castle.\nTechnical Details:\n\n\nCover Material: Hardbound with faux-leather finish\n\nDimensions: 9 x 6 inches\n\nPages: 300 pages\n\nDesign: Gold foil-stamped cover with intricate detailing\n\nExtras: Includes a ribbon bookmark",
        descriptionHtml: `<p>Discover the rich history of Hogwarts School of Witchcraft and Wizardry with "Hogwarts: A History," an essential read for any Harry Potter fan. This beautifully bound book is filled with fascinating tales and secrets of the castle.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Cover Material:</strong> Hardbound with faux-leather finish</li>
<li>
<strong>Dimensions:</strong> 9 x 6 inches</li>
<li>
<strong>Pages:</strong> 300 pages</li>
<li>
<strong>Design:</strong> Gold foil-stamped cover with intricate detailing</li>
<li>
<strong>Extras:</strong> Includes a ribbon bookmark</li>
</ul>
<!---->`,
        tags: ["preorder"],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Hogwarts: A History + Library Collection", description: ""},
        collections: {nodes: [{handle: "library-collection", title: "Library Collection"}]},
        featuredImage: img("hogwarts-a-history-img-1", `${IMG_BASE}/hogwarts_a_history_library_collection_1.avif`, "Hogwarts: A History + Library Collection"),
        images: {nodes: [
            img("hogwarts-a-history-img-1", `${IMG_BASE}/hogwarts_a_history_library_collection_1.avif`, "Hogwarts: A History + Library Collection"),
            img("hogwarts-a-history-img-2", `${IMG_BASE}/hogwarts_a_history_library_collection_2.avif`, "Hogwarts: A History + Library Collection"),
            img("hogwarts-a-history-img-3", `${IMG_BASE}/hogwarts_a_history_library_collection_3.avif`, "Hogwarts: A History + Library Collection"),
            img("hogwarts-a-history-img-4", `${IMG_BASE}/hogwarts_a_history_library_collection_4.avif`, "Hogwarts: A History + Library Collection"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "hogwarts-a-history-media-1", alt: "Hogwarts: A History + Library Collection", image: img("hogwarts-a-history-img-1", `${IMG_BASE}/hogwarts_a_history_library_collection_1.avif`, "Hogwarts: A History + Library Collection")},
            {__typename: "MediaImage" as const, id: "hogwarts-a-history-media-2", alt: "Hogwarts: A History + Library Collection", image: img("hogwarts-a-history-img-2", `${IMG_BASE}/hogwarts_a_history_library_collection_2.avif`, "Hogwarts: A History + Library Collection")},
            {__typename: "MediaImage" as const, id: "hogwarts-a-history-media-3", alt: "Hogwarts: A History + Library Collection", image: img("hogwarts-a-history-img-3", `${IMG_BASE}/hogwarts_a_history_library_collection_3.avif`, "Hogwarts: A History + Library Collection")},
            {__typename: "MediaImage" as const, id: "hogwarts-a-history-media-4", alt: "Hogwarts: A History + Library Collection", image: img("hogwarts-a-history-img-4", `${IMG_BASE}/hogwarts_a_history_library_collection_4.avif`, "Hogwarts: A History + Library Collection")},
        ]},
        priceRange: {minVariantPrice: money("0.0"), maxVariantPrice: money("0.0")},
        compareAtPriceRange: {minVariantPrice: money("0.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/hogwarts-a-history-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 54,
                price: money("0.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("hogwarts-a-history-img-1", `${IMG_BASE}/hogwarts_a_history_library_collection_1.avif`, "Hogwarts: A History + Library Collection"),
                product: {title: "Hogwarts: A History + Library Collection", handle: "hogwarts-a-history"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hogwarts-a-history-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 54,
                            price: money("0.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("hogwarts-a-history-img-1", `${IMG_BASE}/hogwarts_a_history_library_collection_1.avif`, "Hogwarts: A History + Library Collection"),
                            product: {title: "Hogwarts: A History + Library Collection", handle: "hogwarts-a-history"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/hogwarts-a-history-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 54,
            price: money("0.00"), compareAtPrice: null,
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("hogwarts-a-history-img-1", `${IMG_BASE}/hogwarts_a_history_library_collection_1.avif`, "Hogwarts: A History + Library Collection"),
            product: {title: "Hogwarts: A History + Library Collection", handle: "hogwarts-a-history"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/the-tales-of-beedle-the-bard",
        handle: "the-tales-of-beedle-the-bard",
        title: "The Tales of Beedle the Bard + Library Collection",
        vendor: "horcrux-demo-store",
        description: "Delve into the magical fairy tales with \"The Tales of Beedle the Bard,\" a collection of enchanting stories beloved by witches and wizards. This beautifully illustrated book is a perfect addition to any Harry Potter library.\nTechnical Details:\n\n\nCover Material: Hardbound with faux-leather finish\n\nDimensions: 8 x 5.5 inches\n\nPages: 200 pages\n\nIllustrations: Full-color illustrations throughout\n\nDesign: Silver foil-stamped cover with intricate detailing",
        descriptionHtml: `<p>Delve into the magical fairy tales with "The Tales of Beedle the Bard," a collection of enchanting stories beloved by witches and wizards. This beautifully illustrated book is a perfect addition to any Harry Potter library.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Cover Material:</strong> Hardbound with faux-leather finish</li>
<li>
<strong>Dimensions:</strong> 8 x 5.5 inches</li>
<li>
<strong>Pages:</strong> 200 pages</li>
<li>
<strong>Illustrations:</strong> Full-color illustrations throughout</li>
<li>
<strong>Design:</strong> Silver foil-stamped cover with intricate detailing</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "The Tales of Beedle the Bard + Library Collection", description: ""},
        collections: {nodes: [{handle: "library-collection", title: "Library Collection"}]},
        featuredImage: img("the-tales-of-beedle-the-bard-img-1", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_1.avif`, "The Tales of Beedle the Bard + Library Collection"),
        images: {nodes: [
            img("the-tales-of-beedle-the-bard-img-1", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_1.avif`, "The Tales of Beedle the Bard + Library Collection"),
            img("the-tales-of-beedle-the-bard-img-2", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_2.avif`, "The Tales of Beedle the Bard + Library Collection"),
            img("the-tales-of-beedle-the-bard-img-3", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_3.avif`, "The Tales of Beedle the Bard + Library Collection"),
            img("the-tales-of-beedle-the-bard-img-4", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_4.avif`, "The Tales of Beedle the Bard + Library Collection"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "the-tales-of-beedle-the-bard-media-1", alt: "The Tales of Beedle the Bard + Library Collection", image: img("the-tales-of-beedle-the-bard-img-1", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_1.avif`, "The Tales of Beedle the Bard + Library Collection")},
            {__typename: "MediaImage" as const, id: "the-tales-of-beedle-the-bard-media-2", alt: "The Tales of Beedle the Bard + Library Collection", image: img("the-tales-of-beedle-the-bard-img-2", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_2.avif`, "The Tales of Beedle the Bard + Library Collection")},
            {__typename: "MediaImage" as const, id: "the-tales-of-beedle-the-bard-media-3", alt: "The Tales of Beedle the Bard + Library Collection", image: img("the-tales-of-beedle-the-bard-img-3", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_3.avif`, "The Tales of Beedle the Bard + Library Collection")},
            {__typename: "MediaImage" as const, id: "the-tales-of-beedle-the-bard-media-4", alt: "The Tales of Beedle the Bard + Library Collection", image: img("the-tales-of-beedle-the-bard-img-4", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_4.avif`, "The Tales of Beedle the Bard + Library Collection")},
        ]},
        priceRange: {minVariantPrice: money("0.0"), maxVariantPrice: money("0.0")},
        compareAtPriceRange: {minVariantPrice: money("0.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/the-tales-of-beedle-the-bard-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 94,
                price: money("0.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("the-tales-of-beedle-the-bard-img-1", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_1.avif`, "The Tales of Beedle the Bard + Library Collection"),
                product: {title: "The Tales of Beedle the Bard + Library Collection", handle: "the-tales-of-beedle-the-bard"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/the-tales-of-beedle-the-bard-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 94,
                            price: money("0.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("the-tales-of-beedle-the-bard-img-1", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_1.avif`, "The Tales of Beedle the Bard + Library Collection"),
                            product: {title: "The Tales of Beedle the Bard + Library Collection", handle: "the-tales-of-beedle-the-bard"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/the-tales-of-beedle-the-bard-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 94,
            price: money("0.00"), compareAtPrice: null,
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("the-tales-of-beedle-the-bard-img-1", `${IMG_BASE}/the_tales_of_beedle_the_bard_library_collection_1.avif`, "The Tales of Beedle the Bard + Library Collection"),
            product: {title: "The Tales of Beedle the Bard + Library Collection", handle: "the-tales-of-beedle-the-bard"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/quidditch-through-the-ages",
        handle: "quidditch-through-the-ages",
        title: "Quidditch Through the Ages + Library Collection",
        vendor: "horcrux-demo-store",
        description: "Explore the thrilling world of Quidditch with \"Quidditch Through the Ages,\" a comprehensive guide to the history, rules, and famous teams of the wizarding world's favorite sport. A must-read for any Quidditch enthusiast.\nTechnical Details:\n\n\nCover Material: Hardbound with faux-leather finish\n\nDimensions: 8 x 5.5 inches\n\nPages: 220 pages\n\nDesign: Embossed cover with gold foil detailing\n\nExtras: Includes historical illustrations and diagrams",
        descriptionHtml: `<p>Explore the thrilling world of Quidditch with "Quidditch Through the Ages," a comprehensive guide to the history, rules, and famous teams of the wizarding world's favorite sport. A must-read for any Quidditch enthusiast.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Cover Material:</strong> Hardbound with faux-leather finish</li>
<li>
<strong>Dimensions:</strong> 8 x 5.5 inches</li>
<li>
<strong>Pages:</strong> 220 pages</li>
<li>
<strong>Design:</strong> Embossed cover with gold foil detailing</li>
<li>
<strong>Extras:</strong> Includes historical illustrations and diagrams</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Quidditch Through the Ages + Library Collection", description: ""},
        collections: {nodes: [{handle: "library-collection", title: "Library Collection"}]},
        featuredImage: img("quidditch-through-the-ages-img-1", `${IMG_BASE}/quidditch_through_the_ages_library_collection_1.avif`, "Quidditch Through the Ages + Library Collection"),
        images: {nodes: [
            img("quidditch-through-the-ages-img-1", `${IMG_BASE}/quidditch_through_the_ages_library_collection_1.avif`, "Quidditch Through the Ages + Library Collection"),
            img("quidditch-through-the-ages-img-2", `${IMG_BASE}/quidditch_through_the_ages_library_collection_2.avif`, "Quidditch Through the Ages + Library Collection"),
            img("quidditch-through-the-ages-img-3", `${IMG_BASE}/quidditch_through_the_ages_library_collection_3.avif`, "Quidditch Through the Ages + Library Collection"),
            img("quidditch-through-the-ages-img-4", `${IMG_BASE}/quidditch_through_the_ages_library_collection_4.avif`, "Quidditch Through the Ages + Library Collection"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "quidditch-through-the-ages-media-1", alt: "Quidditch Through the Ages + Library Collection", image: img("quidditch-through-the-ages-img-1", `${IMG_BASE}/quidditch_through_the_ages_library_collection_1.avif`, "Quidditch Through the Ages + Library Collection")},
            {__typename: "MediaImage" as const, id: "quidditch-through-the-ages-media-2", alt: "Quidditch Through the Ages + Library Collection", image: img("quidditch-through-the-ages-img-2", `${IMG_BASE}/quidditch_through_the_ages_library_collection_2.avif`, "Quidditch Through the Ages + Library Collection")},
            {__typename: "MediaImage" as const, id: "quidditch-through-the-ages-media-3", alt: "Quidditch Through the Ages + Library Collection", image: img("quidditch-through-the-ages-img-3", `${IMG_BASE}/quidditch_through_the_ages_library_collection_3.avif`, "Quidditch Through the Ages + Library Collection")},
            {__typename: "MediaImage" as const, id: "quidditch-through-the-ages-media-4", alt: "Quidditch Through the Ages + Library Collection", image: img("quidditch-through-the-ages-img-4", `${IMG_BASE}/quidditch_through_the_ages_library_collection_4.avif`, "Quidditch Through the Ages + Library Collection")},
        ]},
        priceRange: {minVariantPrice: money("0.0"), maxVariantPrice: money("0.0")},
        compareAtPriceRange: {minVariantPrice: money("0.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/quidditch-through-the-ages-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 124,
                price: money("0.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("quidditch-through-the-ages-img-1", `${IMG_BASE}/quidditch_through_the_ages_library_collection_1.avif`, "Quidditch Through the Ages + Library Collection"),
                product: {title: "Quidditch Through the Ages + Library Collection", handle: "quidditch-through-the-ages"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/quidditch-through-the-ages-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 124,
                            price: money("0.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("quidditch-through-the-ages-img-1", `${IMG_BASE}/quidditch_through_the_ages_library_collection_1.avif`, "Quidditch Through the Ages + Library Collection"),
                            product: {title: "Quidditch Through the Ages + Library Collection", handle: "quidditch-through-the-ages"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/quidditch-through-the-ages-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 124,
            price: money("0.00"), compareAtPrice: null,
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("quidditch-through-the-ages-img-1", `${IMG_BASE}/quidditch_through_the_ages_library_collection_1.avif`, "Quidditch Through the Ages + Library Collection"),
            product: {title: "Quidditch Through the Ages + Library Collection", handle: "quidditch-through-the-ages"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/fantastic-beasts-and-where-to-find-them",
        handle: "fantastic-beasts-and-where-to-find-them",
        title: "Fantastic Beasts and Where to Find Them + Library Collection",
        vendor: "horcrux-demo-store",
        description: "Uncover the magical creatures of the wizarding world with \"Fantastic Beasts and Where to Find Them,\" a detailed compendium by Newt Scamander. Perfect for any aspiring magizoologist, this book is filled with fascinating information and illustrations.\nTechnical Details:\n\n\nCover Material: Hardbound with faux-leather finish\n\nDimensions: 9 x 6 inches\n\nPages: 250 pages\n\nIllustrations: Full-color illustrations throughout\n\nDesign: Embossed cover with silver foil detailing",
        descriptionHtml: `<p>Uncover the magical creatures of the wizarding world with "Fantastic Beasts and Where to Find Them," a detailed compendium by Newt Scamander. Perfect for any aspiring magizoologist, this book is filled with fascinating information and illustrations.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Cover Material:</strong> Hardbound with faux-leather finish</li>
<li>
<strong>Dimensions:</strong> 9 x 6 inches</li>
<li>
<strong>Pages:</strong> 250 pages</li>
<li>
<strong>Illustrations:</strong> Full-color illustrations throughout</li>
<li>
<strong>Design:</strong> Embossed cover with silver foil detailing</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Fantastic Beasts and Where to Find Them + Library Collection", description: ""},
        collections: {nodes: [{handle: "library-collection", title: "Library Collection"}]},
        featuredImage: img("fantastic-beasts-and-where-to-find-them-img-1", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_1.avif`, "Fantastic Beasts and Where to Find Them + Library Collection"),
        images: {nodes: [
            img("fantastic-beasts-and-where-to-find-them-img-1", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_1.avif`, "Fantastic Beasts and Where to Find Them + Library Collection"),
            img("fantastic-beasts-and-where-to-find-them-img-2", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_2.avif`, "Fantastic Beasts and Where to Find Them + Library Collection"),
            img("fantastic-beasts-and-where-to-find-them-img-3", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_3.avif`, "Fantastic Beasts and Where to Find Them + Library Collection"),
            img("fantastic-beasts-and-where-to-find-them-img-4", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_4.avif`, "Fantastic Beasts and Where to Find Them + Library Collection"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "fantastic-beasts-and-where-to-find-them-media-1", alt: "Fantastic Beasts and Where to Find Them + Library Collection", image: img("fantastic-beasts-and-where-to-find-them-img-1", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_1.avif`, "Fantastic Beasts and Where to Find Them + Library Collection")},
            {__typename: "MediaImage" as const, id: "fantastic-beasts-and-where-to-find-them-media-2", alt: "Fantastic Beasts and Where to Find Them + Library Collection", image: img("fantastic-beasts-and-where-to-find-them-img-2", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_2.avif`, "Fantastic Beasts and Where to Find Them + Library Collection")},
            {__typename: "MediaImage" as const, id: "fantastic-beasts-and-where-to-find-them-media-3", alt: "Fantastic Beasts and Where to Find Them + Library Collection", image: img("fantastic-beasts-and-where-to-find-them-img-3", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_3.avif`, "Fantastic Beasts and Where to Find Them + Library Collection")},
            {__typename: "MediaImage" as const, id: "fantastic-beasts-and-where-to-find-them-media-4", alt: "Fantastic Beasts and Where to Find Them + Library Collection", image: img("fantastic-beasts-and-where-to-find-them-img-4", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_4.avif`, "Fantastic Beasts and Where to Find Them + Library Collection")},
        ]},
        priceRange: {minVariantPrice: money("0.0"), maxVariantPrice: money("0.0")},
        compareAtPriceRange: {minVariantPrice: money("0.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/fantastic-beasts-and-where-to-find-them-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 56,
                price: money("0.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("fantastic-beasts-and-where-to-find-them-img-1", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_1.avif`, "Fantastic Beasts and Where to Find Them + Library Collection"),
                product: {title: "Fantastic Beasts and Where to Find Them + Library Collection", handle: "fantastic-beasts-and-where-to-find-them"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/fantastic-beasts-and-where-to-find-them-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 56,
                            price: money("0.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("fantastic-beasts-and-where-to-find-them-img-1", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_1.avif`, "Fantastic Beasts and Where to Find Them + Library Collection"),
                            product: {title: "Fantastic Beasts and Where to Find Them + Library Collection", handle: "fantastic-beasts-and-where-to-find-them"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/fantastic-beasts-and-where-to-find-them-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 56,
            price: money("0.00"), compareAtPrice: null,
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("fantastic-beasts-and-where-to-find-them-img-1", `${IMG_BASE}/fantastic_beasts_and_where_to_find_them_library_collection_1.avif`, "Fantastic Beasts and Where to Find Them + Library Collection"),
            product: {title: "Fantastic Beasts and Where to Find Them + Library Collection", handle: "fantastic-beasts-and-where-to-find-them"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/harry-potters-wand",
        handle: "harry-potters-wand",
        title: "Harry Potter's Wand + Wands",
        vendor: "horcrux-demo-store",
        description: "Channel your inner Harry Potter with his iconic wand, a faithful replica of the one used by the Boy Who Lived. This finely crafted wand is perfect for practicing your spells and making your magical adventures come to life.\nTechnical Details:\n\n\nMaterial: Resin with wood-like finish\n\nLength: 14 inches\n\nDesign: Detailed replica with vine engravings\n\nPackaging: Comes in an Ollivanders wand box",
        descriptionHtml: `<p>Channel your inner Harry Potter with his iconic wand, a faithful replica of the one used by the Boy Who Lived. This finely crafted wand is perfect for practicing your spells and making your magical adventures come to life.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Resin with wood-like finish</li>
<li>
<strong>Length:</strong> 14 inches</li>
<li>
<strong>Design:</strong> Detailed replica with vine engravings</li>
<li>
<strong>Packaging:</strong> Comes in an Ollivanders wand box</li>
</ul>
<!---->`,
        tags: ["preorder"],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Harry Potter's Wand + Wands", description: ""},
        collections: {nodes: [{handle: "wands", title: "Wands"}]},
        featuredImage: img("harry-potters-wand-img-1", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Harry Potter's Wand + Wands"),
        images: {nodes: [
            img("harry-potters-wand-img-1", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Harry Potter's Wand + Wands"),
            img("harry-potters-wand-img-2", `${IMG_BASE}/harry_potters_wand_wands_2.avif`, "Harry Potter's Wand + Wands"),
            img("harry-potters-wand-img-3", `${IMG_BASE}/harry_potters_wand_wands_3.avif`, "Harry Potter's Wand + Wands"),
            img("harry-potters-wand-img-4", `${IMG_BASE}/harry_potters_wand_wands_4.avif`, "Harry Potter's Wand + Wands"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "harry-potters-wand-media-1", alt: "Harry Potter's Wand + Wands", image: img("harry-potters-wand-img-1", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Harry Potter's Wand + Wands")},
            {__typename: "MediaImage" as const, id: "harry-potters-wand-media-2", alt: "Harry Potter's Wand + Wands", image: img("harry-potters-wand-img-2", `${IMG_BASE}/harry_potters_wand_wands_2.avif`, "Harry Potter's Wand + Wands")},
            {__typename: "MediaImage" as const, id: "harry-potters-wand-media-3", alt: "Harry Potter's Wand + Wands", image: img("harry-potters-wand-img-3", `${IMG_BASE}/harry_potters_wand_wands_3.avif`, "Harry Potter's Wand + Wands")},
            {__typename: "MediaImage" as const, id: "harry-potters-wand-media-4", alt: "Harry Potter's Wand + Wands", image: img("harry-potters-wand-img-4", `${IMG_BASE}/harry_potters_wand_wands_4.avif`, "Harry Potter's Wand + Wands")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("69.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/harry-potters-wand-v1",
                title: "10 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "10 inches"}],
                image: img("harry-potters-wand-img-1", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Harry Potter's Wand + Wands"),
                product: {title: "Harry Potter's Wand + Wands", handle: "harry-potters-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/harry-potters-wand-v2",
                title: "12 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "12 inches"}],
                image: img("harry-potters-wand-img-1", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Harry Potter's Wand + Wands"),
                product: {title: "Harry Potter's Wand + Wands", handle: "harry-potters-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/harry-potters-wand-v3",
                title: "14 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "14 inches"}],
                image: img("harry-potters-wand-img-1", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Harry Potter's Wand + Wands"),
                product: {title: "Harry Potter's Wand + Wands", handle: "harry-potters-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Length",
                optionValues: [
                    {
                        name: "10 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/harry-potters-wand-v1", title: "10 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "10 inches"}],
                            image: img("harry-potters-wand-img-1", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Harry Potter's Wand + Wands"),
                            product: {title: "Harry Potter's Wand + Wands", handle: "harry-potters-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "12 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/harry-potters-wand-v2", title: "12 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "12 inches"}],
                            image: img("harry-potters-wand-img-1", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Harry Potter's Wand + Wands"),
                            product: {title: "Harry Potter's Wand + Wands", handle: "harry-potters-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "14 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/harry-potters-wand-v3", title: "14 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "14 inches"}],
                            image: img("harry-potters-wand-img-1", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Harry Potter's Wand + Wands"),
                            product: {title: "Harry Potter's Wand + Wands", handle: "harry-potters-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/harry-potters-wand-v1", title: "10 inches", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Length", value: "10 inches"}],
            image: img("harry-potters-wand-img-1", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Harry Potter's Wand + Wands"),
            product: {title: "Harry Potter's Wand + Wands", handle: "harry-potters-wand"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/amortentia-vial",
        handle: "amortentia-vial",
        title: "Amortentia Vial + Potion Ingredients",
        vendor: "horcrux-demo-store",
        description: "Experience the allure of the most powerful love potion in the wizarding world with this decorative Amortentia Vial. Perfect for display, this vial adds a touch of magical romance to any collection.\nTechnical Details:\n\n\nMaterial: Glass with a cork stopper\n\nSize: 4 inches tall\n\nDesign: Filled with glittering liquid for effect\n\nLabel: Detailed Amortentia label\n\nPackaging: Comes in a decorative box",
        descriptionHtml: `<p>Experience the allure of the most powerful love potion in the wizarding world with this decorative Amortentia Vial. Perfect for display, this vial adds a touch of magical romance to any collection.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Glass with a cork stopper</li>
<li>
<strong>Size:</strong> 4 inches tall</li>
<li>
<strong>Design:</strong> Filled with glittering liquid for effect</li>
<li>
<strong>Label:</strong> Detailed Amortentia label</li>
<li>
<strong>Packaging:</strong> Comes in a decorative box</li>
</ul>
<!---->`,
        tags: ["preorder"],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Amortentia Vial + Potion Ingredients", description: ""},
        collections: {nodes: [{handle: "potion-ingredients", title: "Potion Ingredients"}]},
        featuredImage: img("amortentia-vial-img-1", `${IMG_BASE}/amortentia_vial_potion_ingredients_1.avif`, "Amortentia Vial + Potion Ingredients"),
        images: {nodes: [
            img("amortentia-vial-img-1", `${IMG_BASE}/amortentia_vial_potion_ingredients_1.avif`, "Amortentia Vial + Potion Ingredients"),
            img("amortentia-vial-img-2", `${IMG_BASE}/amortentia_vial_potion_ingredients_2.avif`, "Amortentia Vial + Potion Ingredients"),
            img("amortentia-vial-img-3", `${IMG_BASE}/amortentia_vial_potion_ingredients_3.avif`, "Amortentia Vial + Potion Ingredients"),
            img("amortentia-vial-img-4", `${IMG_BASE}/amortentia_vial_potion_ingredients_4.avif`, "Amortentia Vial + Potion Ingredients"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "amortentia-vial-media-1", alt: "Amortentia Vial + Potion Ingredients", image: img("amortentia-vial-img-1", `${IMG_BASE}/amortentia_vial_potion_ingredients_1.avif`, "Amortentia Vial + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "amortentia-vial-media-2", alt: "Amortentia Vial + Potion Ingredients", image: img("amortentia-vial-img-2", `${IMG_BASE}/amortentia_vial_potion_ingredients_2.avif`, "Amortentia Vial + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "amortentia-vial-media-3", alt: "Amortentia Vial + Potion Ingredients", image: img("amortentia-vial-img-3", `${IMG_BASE}/amortentia_vial_potion_ingredients_3.avif`, "Amortentia Vial + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "amortentia-vial-media-4", alt: "Amortentia Vial + Potion Ingredients", image: img("amortentia-vial-img-4", `${IMG_BASE}/amortentia_vial_potion_ingredients_4.avif`, "Amortentia Vial + Potion Ingredients")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("420.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/amortentia-vial-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 140,
                price: money("69.00"),
                compareAtPrice: money("420.00"),
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("amortentia-vial-img-1", `${IMG_BASE}/amortentia_vial_potion_ingredients_1.avif`, "Amortentia Vial + Potion Ingredients"),
                product: {title: "Amortentia Vial + Potion Ingredients", handle: "amortentia-vial"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/amortentia-vial-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 140,
                            price: money("69.00"), compareAtPrice: money("420.00"),
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("amortentia-vial-img-1", `${IMG_BASE}/amortentia_vial_potion_ingredients_1.avif`, "Amortentia Vial + Potion Ingredients"),
                            product: {title: "Amortentia Vial + Potion Ingredients", handle: "amortentia-vial"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/amortentia-vial-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 140,
            price: money("69.00"), compareAtPrice: money("420.00"),
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("amortentia-vial-img-1", `${IMG_BASE}/amortentia_vial_potion_ingredients_1.avif`, "Amortentia Vial + Potion Ingredients"),
            product: {title: "Amortentia Vial + Potion Ingredients", handle: "amortentia-vial"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/polyjuice-potion-flask",
        handle: "polyjuice-potion-flask",
        title: "Polyjuice Potion Flask + Potion Ingredients",
        vendor: "horcrux-demo-store",
        description: "Transform your decor with the Polyjuice Potion Flask, a perfect replica of the famous potion container. This flask is a great addition to any potion master's collection.\nTechnical Details:\n\n\nMaterial: Glass with a cork stopper\n\nSize: 5 inches tall\n\nDesign: Filled with shimmering liquid for effect\n\nLabel: Detailed Polyjuice Potion label\n\nPackaging: Comes in a decorative box",
        descriptionHtml: `<p>Transform your decor with the Polyjuice Potion Flask, a perfect replica of the famous potion container. This flask is a great addition to any potion master's collection.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Glass with a cork stopper</li>
<li>
<strong>Size:</strong> 5 inches tall</li>
<li>
<strong>Design:</strong> Filled with shimmering liquid for effect</li>
<li>
<strong>Label:</strong> Detailed Polyjuice Potion label</li>
<li>
<strong>Packaging:</strong> Comes in a decorative box</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Polyjuice Potion Flask + Potion Ingredients", description: ""},
        collections: {nodes: [{handle: "potion-ingredients", title: "Potion Ingredients"}]},
        featuredImage: img("polyjuice-potion-flask-img-1", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_1.avif`, "Polyjuice Potion Flask + Potion Ingredients"),
        images: {nodes: [
            img("polyjuice-potion-flask-img-1", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_1.avif`, "Polyjuice Potion Flask + Potion Ingredients"),
            img("polyjuice-potion-flask-img-2", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_2.avif`, "Polyjuice Potion Flask + Potion Ingredients"),
            img("polyjuice-potion-flask-img-3", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_3.avif`, "Polyjuice Potion Flask + Potion Ingredients"),
            img("polyjuice-potion-flask-img-4", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_4.avif`, "Polyjuice Potion Flask + Potion Ingredients"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "polyjuice-potion-flask-media-1", alt: "Polyjuice Potion Flask + Potion Ingredients", image: img("polyjuice-potion-flask-img-1", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_1.avif`, "Polyjuice Potion Flask + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "polyjuice-potion-flask-media-2", alt: "Polyjuice Potion Flask + Potion Ingredients", image: img("polyjuice-potion-flask-img-2", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_2.avif`, "Polyjuice Potion Flask + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "polyjuice-potion-flask-media-3", alt: "Polyjuice Potion Flask + Potion Ingredients", image: img("polyjuice-potion-flask-img-3", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_3.avif`, "Polyjuice Potion Flask + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "polyjuice-potion-flask-media-4", alt: "Polyjuice Potion Flask + Potion Ingredients", image: img("polyjuice-potion-flask-img-4", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_4.avif`, "Polyjuice Potion Flask + Potion Ingredients")},
        ]},
        priceRange: {minVariantPrice: money("0.0"), maxVariantPrice: money("0.0")},
        compareAtPriceRange: {minVariantPrice: money("0.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/polyjuice-potion-flask-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 454,
                price: money("0.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("polyjuice-potion-flask-img-1", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_1.avif`, "Polyjuice Potion Flask + Potion Ingredients"),
                product: {title: "Polyjuice Potion Flask + Potion Ingredients", handle: "polyjuice-potion-flask"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/polyjuice-potion-flask-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 454,
                            price: money("0.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("polyjuice-potion-flask-img-1", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_1.avif`, "Polyjuice Potion Flask + Potion Ingredients"),
                            product: {title: "Polyjuice Potion Flask + Potion Ingredients", handle: "polyjuice-potion-flask"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/polyjuice-potion-flask-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 454,
            price: money("0.00"), compareAtPrice: null,
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("polyjuice-potion-flask-img-1", `${IMG_BASE}/polyjuice_potion_flask_potion_ingredients_1.avif`, "Polyjuice Potion Flask + Potion Ingredients"),
            product: {title: "Polyjuice Potion Flask + Potion Ingredients", handle: "polyjuice-potion-flask"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/felix-felicis-bottle",
        handle: "felix-felicis-bottle",
        title: "Felix Felicis Bottle + Potion Ingredients",
        vendor: "horcrux-demo-store",
        description: "Bring a bit of luck into your life with this decorative Felix Felicis Bottle. Known as Liquid Luck, this bottle is a must-have for any fan who wants a touch of magical fortune.\nTechnical Details:\n\n\nMaterial: Glass with a cork stopper\n\nSize: 3 inches tall\n\nDesign: Filled with golden liquid for effect\n\nLabel: Detailed Felix Felicis label\n\nPackaging: Comes in a decorative box",
        descriptionHtml: `<p>Bring a bit of luck into your life with this decorative Felix Felicis Bottle. Known as Liquid Luck, this bottle is a must-have for any fan who wants a touch of magical fortune.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Glass with a cork stopper</li>
<li>
<strong>Size:</strong> 3 inches tall</li>
<li>
<strong>Design:</strong> Filled with golden liquid for effect</li>
<li>
<strong>Label:</strong> Detailed Felix Felicis label</li>
<li>
<strong>Packaging:</strong> Comes in a decorative box</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Felix Felicis Bottle + Potion Ingredients", description: ""},
        collections: {nodes: [{handle: "potion-ingredients", title: "Potion Ingredients"}]},
        featuredImage: img("felix-felicis-bottle-img-1", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_1.avif`, "Felix Felicis Bottle + Potion Ingredients"),
        images: {nodes: [
            img("felix-felicis-bottle-img-1", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_1.avif`, "Felix Felicis Bottle + Potion Ingredients"),
            img("felix-felicis-bottle-img-2", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_2.avif`, "Felix Felicis Bottle + Potion Ingredients"),
            img("felix-felicis-bottle-img-3", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_3.avif`, "Felix Felicis Bottle + Potion Ingredients"),
            img("felix-felicis-bottle-img-4", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_4.avif`, "Felix Felicis Bottle + Potion Ingredients"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "felix-felicis-bottle-media-1", alt: "Felix Felicis Bottle + Potion Ingredients", image: img("felix-felicis-bottle-img-1", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_1.avif`, "Felix Felicis Bottle + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "felix-felicis-bottle-media-2", alt: "Felix Felicis Bottle + Potion Ingredients", image: img("felix-felicis-bottle-img-2", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_2.avif`, "Felix Felicis Bottle + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "felix-felicis-bottle-media-3", alt: "Felix Felicis Bottle + Potion Ingredients", image: img("felix-felicis-bottle-img-3", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_3.avif`, "Felix Felicis Bottle + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "felix-felicis-bottle-media-4", alt: "Felix Felicis Bottle + Potion Ingredients", image: img("felix-felicis-bottle-img-4", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_4.avif`, "Felix Felicis Bottle + Potion Ingredients")},
        ]},
        priceRange: {minVariantPrice: money("0.0"), maxVariantPrice: money("0.0")},
        compareAtPriceRange: {minVariantPrice: money("0.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/felix-felicis-bottle-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 71,
                price: money("0.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("felix-felicis-bottle-img-1", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_1.avif`, "Felix Felicis Bottle + Potion Ingredients"),
                product: {title: "Felix Felicis Bottle + Potion Ingredients", handle: "felix-felicis-bottle"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/felix-felicis-bottle-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 71,
                            price: money("0.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("felix-felicis-bottle-img-1", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_1.avif`, "Felix Felicis Bottle + Potion Ingredients"),
                            product: {title: "Felix Felicis Bottle + Potion Ingredients", handle: "felix-felicis-bottle"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/felix-felicis-bottle-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 71,
            price: money("0.00"), compareAtPrice: null,
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("felix-felicis-bottle-img-1", `${IMG_BASE}/felix_felicis_bottle_potion_ingredients_1.avif`, "Felix Felicis Bottle + Potion Ingredients"),
            product: {title: "Felix Felicis Bottle + Potion Ingredients", handle: "felix-felicis-bottle"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/gillyweed-replica",
        handle: "gillyweed-replica",
        title: "Gillyweed Replica + Potion Ingredients",
        vendor: "horcrux-demo-store",
        description: "Dive into the magical world with this realistic Gillyweed Replica, perfect for any potion ingredient collection. This detailed replica is a fun and unique addition for any Harry Potter enthusiast.\nTechnical Details:\n\n\nMaterial: Synthetic materials\n\nSize: 6 inches in length\n\nDesign: Realistic look and feel\n\nPackaging: Comes in a decorative vial with a label",
        descriptionHtml: `<p>Dive into the magical world with this realistic Gillyweed Replica, perfect for any potion ingredient collection. This detailed replica is a fun and unique addition for any Harry Potter enthusiast.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Synthetic materials</li>
<li>
<strong>Size:</strong> 6 inches in length</li>
<li>
<strong>Design:</strong> Realistic look and feel</li>
<li>
<strong>Packaging:</strong> Comes in a decorative vial with a label</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Gillyweed Replica + Potion Ingredients", description: ""},
        collections: {nodes: [{handle: "potion-ingredients", title: "Potion Ingredients"}]},
        featuredImage: img("gillyweed-replica-img-1", `${IMG_BASE}/gillyweed_replica_potion_ingredients_1.avif`, "Gillyweed Replica + Potion Ingredients"),
        images: {nodes: [
            img("gillyweed-replica-img-1", `${IMG_BASE}/gillyweed_replica_potion_ingredients_1.avif`, "Gillyweed Replica + Potion Ingredients"),
            img("gillyweed-replica-img-2", `${IMG_BASE}/gillyweed_replica_potion_ingredients_2.avif`, "Gillyweed Replica + Potion Ingredients"),
            img("gillyweed-replica-img-3", `${IMG_BASE}/gillyweed_replica_potion_ingredients_3.avif`, "Gillyweed Replica + Potion Ingredients"),
            img("gillyweed-replica-img-4", `${IMG_BASE}/gillyweed_replica_potion_ingredients_4.avif`, "Gillyweed Replica + Potion Ingredients"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "gillyweed-replica-media-1", alt: "Gillyweed Replica + Potion Ingredients", image: img("gillyweed-replica-img-1", `${IMG_BASE}/gillyweed_replica_potion_ingredients_1.avif`, "Gillyweed Replica + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "gillyweed-replica-media-2", alt: "Gillyweed Replica + Potion Ingredients", image: img("gillyweed-replica-img-2", `${IMG_BASE}/gillyweed_replica_potion_ingredients_2.avif`, "Gillyweed Replica + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "gillyweed-replica-media-3", alt: "Gillyweed Replica + Potion Ingredients", image: img("gillyweed-replica-img-3", `${IMG_BASE}/gillyweed_replica_potion_ingredients_3.avif`, "Gillyweed Replica + Potion Ingredients")},
            {__typename: "MediaImage" as const, id: "gillyweed-replica-media-4", alt: "Gillyweed Replica + Potion Ingredients", image: img("gillyweed-replica-img-4", `${IMG_BASE}/gillyweed_replica_potion_ingredients_4.avif`, "Gillyweed Replica + Potion Ingredients")},
        ]},
        priceRange: {minVariantPrice: money("0.0"), maxVariantPrice: money("0.0")},
        compareAtPriceRange: {minVariantPrice: money("0.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/gillyweed-replica-v1",
                title: "Default Title",
                sku: "",
                availableForSale: true,
                quantityAvailable: 111,
                price: money("0.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Title", value: "Default Title"}],
                image: img("gillyweed-replica-img-1", `${IMG_BASE}/gillyweed_replica_potion_ingredients_1.avif`, "Gillyweed Replica + Potion Ingredients"),
                product: {title: "Gillyweed Replica + Potion Ingredients", handle: "gillyweed-replica"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Title",
                optionValues: [
                    {
                        name: "Default Title",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/gillyweed-replica-v1", title: "Default Title", sku: "",
                            availableForSale: true, quantityAvailable: 111,
                            price: money("0.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Title", value: "Default Title"}],
                            image: img("gillyweed-replica-img-1", `${IMG_BASE}/gillyweed_replica_potion_ingredients_1.avif`, "Gillyweed Replica + Potion Ingredients"),
                            product: {title: "Gillyweed Replica + Potion Ingredients", handle: "gillyweed-replica"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/gillyweed-replica-v1", title: "Default Title", sku: "",
            availableForSale: true, quantityAvailable: 111,
            price: money("0.00"), compareAtPrice: null,
            selectedOptions: [{name: "Title", value: "Default Title"}],
            image: img("gillyweed-replica-img-1", `${IMG_BASE}/gillyweed_replica_potion_ingredients_1.avif`, "Gillyweed Replica + Potion Ingredients"),
            product: {title: "Gillyweed Replica + Potion Ingredients", handle: "gillyweed-replica"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/voldemorts-wand",
        handle: "voldemorts-wand",
        title: "Voldemort's Wand + Wands",
        vendor: "horcrux-demo-store",
        description: "Wield the power of the Dark Lord with Voldemort's Wand, a sinister and elegant replica of the wand used by He-Who-Must-Not-Be-Named. This meticulously crafted wand is perfect for any collector or aspiring dark wizard.\nTechnical Details:\n\n\nMaterial: Resin\n\nLength: 13.5 inches\n\nFinish: Hand-painted with intricate bone-like detailing\n\nPackaging: Comes in an Ollivanders box with a velvet lining\n\nExtras: Includes a replica of Voldemort's wand stand",
        descriptionHtml: `<p>Wield the power of the Dark Lord with Voldemort's Wand, a sinister and elegant replica of the wand used by He-Who-Must-Not-Be-Named. This meticulously crafted wand is perfect for any collector or aspiring dark wizard.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Resin</li>
<li>
<strong>Length:</strong> 13.5 inches</li>
<li>
<strong>Finish:</strong> Hand-painted with intricate bone-like detailing</li>
<li>
<strong>Packaging:</strong> Comes in an Ollivanders box with a velvet lining</li>
<li>
<strong>Extras:</strong> Includes a replica of Voldemort's wand stand</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Voldemort's Wand + Wands", description: ""},
        collections: {nodes: [{handle: "wands", title: "Wands"}]},
        featuredImage: img("voldemorts-wand-img-1", `${IMG_BASE}/voldemorts_wand_wands_1.avif`, "Voldemort's Wand + Wands"),
        images: {nodes: [
            img("voldemorts-wand-img-1", `${IMG_BASE}/voldemorts_wand_wands_1.avif`, "Voldemort's Wand + Wands"),
            img("voldemorts-wand-img-2", `${IMG_BASE}/voldemorts_wand_wands_2.avif`, "Voldemort's Wand + Wands"),
            img("voldemorts-wand-img-3", `${IMG_BASE}/voldemorts_wand_wands_3.avif`, "Voldemort's Wand + Wands"),
            img("voldemorts-wand-img-4", `${IMG_BASE}/voldemorts_wand_wands_4.avif`, "Voldemort's Wand + Wands"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "voldemorts-wand-media-1", alt: "Voldemort's Wand + Wands", image: img("voldemorts-wand-img-1", `${IMG_BASE}/voldemorts_wand_wands_1.avif`, "Voldemort's Wand + Wands")},
            {__typename: "MediaImage" as const, id: "voldemorts-wand-media-2", alt: "Voldemort's Wand + Wands", image: img("voldemorts-wand-img-2", `${IMG_BASE}/voldemorts_wand_wands_2.avif`, "Voldemort's Wand + Wands")},
            {__typename: "MediaImage" as const, id: "voldemorts-wand-media-3", alt: "Voldemort's Wand + Wands", image: img("voldemorts-wand-img-3", `${IMG_BASE}/voldemorts_wand_wands_3.avif`, "Voldemort's Wand + Wands")},
            {__typename: "MediaImage" as const, id: "voldemorts-wand-media-4", alt: "Voldemort's Wand + Wands", image: img("voldemorts-wand-img-4", `${IMG_BASE}/voldemorts_wand_wands_4.avif`, "Voldemort's Wand + Wands")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("69.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/voldemorts-wand-v1",
                title: "10 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "10 inches"}],
                image: img("voldemorts-wand-img-1", `${IMG_BASE}/voldemorts_wand_wands_1.avif`, "Voldemort's Wand + Wands"),
                product: {title: "Voldemort's Wand + Wands", handle: "voldemorts-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/voldemorts-wand-v2",
                title: "12 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "12 inches"}],
                image: img("voldemorts-wand-img-1", `${IMG_BASE}/voldemorts_wand_wands_1.avif`, "Voldemort's Wand + Wands"),
                product: {title: "Voldemort's Wand + Wands", handle: "voldemorts-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/voldemorts-wand-v3",
                title: "14 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "14 inches"}],
                image: img("voldemorts-wand-img-1", `${IMG_BASE}/voldemorts_wand_wands_1.avif`, "Voldemort's Wand + Wands"),
                product: {title: "Voldemort's Wand + Wands", handle: "voldemorts-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Length",
                optionValues: [
                    {
                        name: "10 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/voldemorts-wand-v1", title: "10 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "10 inches"}],
                            image: img("voldemorts-wand-img-1", `${IMG_BASE}/voldemorts_wand_wands_1.avif`, "Voldemort's Wand + Wands"),
                            product: {title: "Voldemort's Wand + Wands", handle: "voldemorts-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "12 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/voldemorts-wand-v2", title: "12 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "12 inches"}],
                            image: img("voldemorts-wand-img-1", `${IMG_BASE}/voldemorts_wand_wands_1.avif`, "Voldemort's Wand + Wands"),
                            product: {title: "Voldemort's Wand + Wands", handle: "voldemorts-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "14 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/voldemorts-wand-v3", title: "14 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "14 inches"}],
                            image: img("voldemorts-wand-img-1", `${IMG_BASE}/voldemorts_wand_wands_1.avif`, "Voldemort's Wand + Wands"),
                            product: {title: "Voldemort's Wand + Wands", handle: "voldemorts-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/voldemorts-wand-v1", title: "10 inches", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Length", value: "10 inches"}],
            image: img("voldemorts-wand-img-1", `${IMG_BASE}/voldemorts_wand_wands_1.avif`, "Voldemort's Wand + Wands"),
            product: {title: "Voldemort's Wand + Wands", handle: "voldemorts-wand"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/elder-wand",
        handle: "elder-wand",
        title: "Elder Wand + Wands",
        vendor: "horcrux-demo-store",
        description: "Possess the most powerful wand in wizarding history with the Elder Wand, an exact replica of the wand wielded by powerful wizards throughout the ages. This wand is an essential addition to any Harry Potter collection.\nTechnical Details:\n\n\nMaterial: Resin\n\nLength: 15 inches\n\nFinish: Hand-painted with elder wood detailing\n\nPackaging: Comes in an Ollivanders box with a velvet lining\n\nExtras: Includes a replica of the Elder Wand's display stand",
        descriptionHtml: `<p>Possess the most powerful wand in wizarding history with the Elder Wand, an exact replica of the wand wielded by powerful wizards throughout the ages. This wand is an essential addition to any Harry Potter collection.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Resin</li>
<li>
<strong>Length:</strong> 15 inches</li>
<li>
<strong>Finish:</strong> Hand-painted with elder wood detailing</li>
<li>
<strong>Packaging:</strong> Comes in an Ollivanders box with a velvet lining</li>
<li>
<strong>Extras:</strong> Includes a replica of the Elder Wand's display stand</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Elder Wand + Wands", description: ""},
        collections: {nodes: [{handle: "wands", title: "Wands"}]},
        featuredImage: img("elder-wand-img-1", `${IMG_BASE}/elder_wand_wands_1.avif`, "Elder Wand + Wands"),
        images: {nodes: [
            img("elder-wand-img-1", `${IMG_BASE}/elder_wand_wands_1.avif`, "Elder Wand + Wands"),
            img("elder-wand-img-2", `${IMG_BASE}/elder_wand_wands_2.avif`, "Elder Wand + Wands"),
            img("elder-wand-img-3", `${IMG_BASE}/elder_wand_wands_3.avif`, "Elder Wand + Wands"),
            img("elder-wand-img-4", `${IMG_BASE}/elder_wand_wands_4.avif`, "Elder Wand + Wands"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "elder-wand-media-1", alt: "Elder Wand + Wands", image: img("elder-wand-img-1", `${IMG_BASE}/elder_wand_wands_1.avif`, "Elder Wand + Wands")},
            {__typename: "MediaImage" as const, id: "elder-wand-media-2", alt: "Elder Wand + Wands", image: img("elder-wand-img-2", `${IMG_BASE}/elder_wand_wands_2.avif`, "Elder Wand + Wands")},
            {__typename: "MediaImage" as const, id: "elder-wand-media-3", alt: "Elder Wand + Wands", image: img("elder-wand-img-3", `${IMG_BASE}/elder_wand_wands_3.avif`, "Elder Wand + Wands")},
            {__typename: "MediaImage" as const, id: "elder-wand-media-4", alt: "Elder Wand + Wands", image: img("elder-wand-img-4", `${IMG_BASE}/elder_wand_wands_4.avif`, "Elder Wand + Wands")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("69.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/elder-wand-v1",
                title: "10 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "10 inches"}],
                image: img("elder-wand-img-1", `${IMG_BASE}/elder_wand_wands_1.avif`, "Elder Wand + Wands"),
                product: {title: "Elder Wand + Wands", handle: "elder-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/elder-wand-v2",
                title: "12 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "12 inches"}],
                image: img("elder-wand-img-1", `${IMG_BASE}/elder_wand_wands_1.avif`, "Elder Wand + Wands"),
                product: {title: "Elder Wand + Wands", handle: "elder-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/elder-wand-v3",
                title: "14 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "14 inches"}],
                image: img("elder-wand-img-1", `${IMG_BASE}/elder_wand_wands_1.avif`, "Elder Wand + Wands"),
                product: {title: "Elder Wand + Wands", handle: "elder-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Length",
                optionValues: [
                    {
                        name: "10 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/elder-wand-v1", title: "10 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "10 inches"}],
                            image: img("elder-wand-img-1", `${IMG_BASE}/elder_wand_wands_1.avif`, "Elder Wand + Wands"),
                            product: {title: "Elder Wand + Wands", handle: "elder-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "12 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/elder-wand-v2", title: "12 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "12 inches"}],
                            image: img("elder-wand-img-1", `${IMG_BASE}/elder_wand_wands_1.avif`, "Elder Wand + Wands"),
                            product: {title: "Elder Wand + Wands", handle: "elder-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "14 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/elder-wand-v3", title: "14 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "14 inches"}],
                            image: img("elder-wand-img-1", `${IMG_BASE}/elder_wand_wands_1.avif`, "Elder Wand + Wands"),
                            product: {title: "Elder Wand + Wands", handle: "elder-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/elder-wand-v1", title: "10 inches", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Length", value: "10 inches"}],
            image: img("elder-wand-img-1", `${IMG_BASE}/elder_wand_wands_1.avif`, "Elder Wand + Wands"),
            product: {title: "Elder Wand + Wands", handle: "elder-wand"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
    {
        id: "gid://shopify/Product/hermione-grangers-wand",
        handle: "hermione-grangers-wand",
        title: "Hermione Granger's Wand + Wands",
        vendor: "horcrux-demo-store",
        description: "Channel the brilliance and bravery of Hermione Granger with this authentic replica of her wand. Perfect for casting spells and solving mysteries, this wand is a must-have for any Hermione fan.\nTechnical Details:\n\n\nMaterial: Resin\n\nLength: 13 inches\n\nFinish: Hand-painted with vine and floral detailing\n\nPackaging: Comes in an Ollivanders box with a velvet lining\n\nExtras: Includes a replica of Hermione's wand holder",
        descriptionHtml: `<p>Channel the brilliance and bravery of Hermione Granger with this authentic replica of her wand. Perfect for casting spells and solving mysteries, this wand is a must-have for any Hermione fan.</p>
<p><strong>Technical Details:</strong></p>
<ul>
<li>
<strong>Material:</strong> Resin</li>
<li>
<strong>Length:</strong> 13 inches</li>
<li>
<strong>Finish:</strong> Hand-painted with vine and floral detailing</li>
<li>
<strong>Packaging:</strong> Comes in an Ollivanders box with a velvet lining</li>
<li>
<strong>Extras:</strong> Includes a replica of Hermione's wand holder</li>
</ul>
<!---->`,
        tags: [],
        availableForSale: true,
        encodedVariantExistence: "",
        encodedVariantAvailability: "",
        sizeChart: null,
        requiresSellingPlan: false,
        sellingPlanGroups: {nodes: []},
        seo: {title: "Hermione Granger's Wand + Wands", description: ""},
        collections: {nodes: [{handle: "wands", title: "Wands"}]},
        featuredImage: img("hermione-grangers-wand-img-1", `${IMG_BASE}/hermione_grangers_wand_wands_1.avif`, "Hermione Granger's Wand + Wands"),
        images: {nodes: [
            img("hermione-grangers-wand-img-1", `${IMG_BASE}/hermione_grangers_wand_wands_1.avif`, "Hermione Granger's Wand + Wands"),
            img("hermione-grangers-wand-img-2", `${IMG_BASE}/hermione_grangers_wand_wands_2.avif`, "Hermione Granger's Wand + Wands"),
            img("hermione-grangers-wand-img-3", `${IMG_BASE}/hermione_grangers_wand_wands_3.avif`, "Hermione Granger's Wand + Wands"),
            img("hermione-grangers-wand-img-4", `${IMG_BASE}/hermione_grangers_wand_wands_4.avif`, "Hermione Granger's Wand + Wands"),
        ]},
        media: {nodes: [
            {__typename: "MediaImage" as const, id: "hermione-grangers-wand-media-1", alt: "Hermione Granger's Wand + Wands", image: img("hermione-grangers-wand-img-1", `${IMG_BASE}/hermione_grangers_wand_wands_1.avif`, "Hermione Granger's Wand + Wands")},
            {__typename: "MediaImage" as const, id: "hermione-grangers-wand-media-2", alt: "Hermione Granger's Wand + Wands", image: img("hermione-grangers-wand-img-2", `${IMG_BASE}/hermione_grangers_wand_wands_2.avif`, "Hermione Granger's Wand + Wands")},
            {__typename: "MediaImage" as const, id: "hermione-grangers-wand-media-3", alt: "Hermione Granger's Wand + Wands", image: img("hermione-grangers-wand-img-3", `${IMG_BASE}/hermione_grangers_wand_wands_3.avif`, "Hermione Granger's Wand + Wands")},
            {__typename: "MediaImage" as const, id: "hermione-grangers-wand-media-4", alt: "Hermione Granger's Wand + Wands", image: img("hermione-grangers-wand-img-4", `${IMG_BASE}/hermione_grangers_wand_wands_4.avif`, "Hermione Granger's Wand + Wands")},
        ]},
        priceRange: {minVariantPrice: money("69.0"), maxVariantPrice: money("69.0")},
        compareAtPriceRange: {minVariantPrice: money("69.0")},
        variants: {nodes: [
            {
                id: "gid://shopify/ProductVariant/hermione-grangers-wand-v1",
                title: "10 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "10 inches"}],
                image: img("hermione-grangers-wand-img-1", `${IMG_BASE}/hermione_grangers_wand_wands_1.avif`, "Hermione Granger's Wand + Wands"),
                product: {title: "Hermione Granger's Wand + Wands", handle: "hermione-grangers-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/hermione-grangers-wand-v2",
                title: "12 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "12 inches"}],
                image: img("hermione-grangers-wand-img-1", `${IMG_BASE}/hermione_grangers_wand_wands_1.avif`, "Hermione Granger's Wand + Wands"),
                product: {title: "Hermione Granger's Wand + Wands", handle: "hermione-grangers-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
            {
                id: "gid://shopify/ProductVariant/hermione-grangers-wand-v3",
                title: "14 inches",
                sku: "",
                availableForSale: true,
                quantityAvailable: 69,
                price: money("69.00"),
                compareAtPrice: null,
                selectedOptions: [{name: "Length", value: "14 inches"}],
                image: img("hermione-grangers-wand-img-1", `${IMG_BASE}/hermione_grangers_wand_wands_1.avif`, "Hermione Granger's Wand + Wands"),
                product: {title: "Hermione Granger's Wand + Wands", handle: "hermione-grangers-wand"},
                sellingPlanAllocations: {nodes: []},
                unitPrice: null,
            },
        ]},
        options: [
            {
                name: "Length",
                optionValues: [
                    {
                        name: "10 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hermione-grangers-wand-v1", title: "10 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "10 inches"}],
                            image: img("hermione-grangers-wand-img-1", `${IMG_BASE}/hermione_grangers_wand_wands_1.avif`, "Hermione Granger's Wand + Wands"),
                            product: {title: "Hermione Granger's Wand + Wands", handle: "hermione-grangers-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "12 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hermione-grangers-wand-v2", title: "12 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "12 inches"}],
                            image: img("hermione-grangers-wand-img-1", `${IMG_BASE}/hermione_grangers_wand_wands_1.avif`, "Hermione Granger's Wand + Wands"),
                            product: {title: "Hermione Granger's Wand + Wands", handle: "hermione-grangers-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                    {
                        name: "14 inches",
                        firstSelectableVariant: {
                            id: "gid://shopify/ProductVariant/hermione-grangers-wand-v3", title: "14 inches", sku: "",
                            availableForSale: true, quantityAvailable: 69,
                            price: money("69.00"), compareAtPrice: null,
                            selectedOptions: [{name: "Length", value: "14 inches"}],
                            image: img("hermione-grangers-wand-img-1", `${IMG_BASE}/hermione_grangers_wand_wands_1.avif`, "Hermione Granger's Wand + Wands"),
                            product: {title: "Hermione Granger's Wand + Wands", handle: "hermione-grangers-wand"},
                            sellingPlanAllocations: {nodes: []}, unitPrice: null,
                        },
                        swatch: null,
                    },
                ],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/hermione-grangers-wand-v1", title: "10 inches", sku: "",
            availableForSale: true, quantityAvailable: 69,
            price: money("69.00"), compareAtPrice: null,
            selectedOptions: [{name: "Length", value: "10 inches"}],
            image: img("hermione-grangers-wand-img-1", `${IMG_BASE}/hermione_grangers_wand_wands_1.avif`, "Hermione Granger's Wand + Wands"),
            product: {title: "Hermione Granger's Wand + Wands", handle: "hermione-grangers-wand"},
            sellingPlanAllocations: {nodes: []}, unitPrice: null,
        },
        adjacentVariants: [],
    },
];

// =============================================================================
// COLLECTION CATALOG
//
// One collection per product type. Multiple types can share a collection
// (e.g. "Writing Instruments" + "Journals & Notebooks" → magical-stationery).
// Collection.products.nodes is computed lazily to avoid circular data issues.
// =============================================================================

const MOCK_COLLECTIONS: MockCollection[] = [
    {
        id: "gid://shopify/Collection/jewelry",
        handle: "jewelry",
        title: "Jewelry",
        description: "Enchanted pieces inspired by the wizarding world \u2014 from house crests to time-turners.",
        seo: {title: "Jewelry", description: "Enchanted pieces inspired by the wizarding world \u2014 from house crests to time-turners."},
        image: img("jewelry-cover", `${IMG_BASE}/charm_bracelet_jewelry_1.avif`, "Jewelry"),
        products: {
            // Populated lazily via getter to avoid self-referential initialisation
            get nodes() { return MOCK_PRODUCTS.filter(p => p.collections.nodes.some(c => c.handle === "jewelry")); },
            pageInfo: {hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null},
        },
    },
    {
        id: "gid://shopify/Collection/robes",
        handle: "robes",
        title: "Robes",
        description: "Authentic house robes for Gryffindor, Slytherin, Ravenclaw, and Hufflepuff.",
        seo: {title: "Robes", description: "Authentic house robes for Gryffindor, Slytherin, Ravenclaw, and Hufflepuff."},
        image: img("robes-cover", `${IMG_BASE}/hufflepuff_robe_robes_1.avif`, "Robes"),
        products: {
            // Populated lazily via getter to avoid self-referential initialisation
            get nodes() { return MOCK_PRODUCTS.filter(p => p.collections.nodes.some(c => c.handle === "robes")); },
            pageInfo: {hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null},
        },
    },
    {
        id: "gid://shopify/Collection/magical-stationery",
        handle: "magical-stationery",
        title: "Magical Stationery",
        description: "Journals, notebooks, and writing instruments fit for a Hogwarts student.",
        seo: {title: "Magical Stationery", description: "Journals, notebooks, and writing instruments fit for a Hogwarts student."},
        image: img("magical-stationery-cover", `${IMG_BASE}/spell_engraved_pencils_magical_stationery_1.avif`, "Magical Stationery"),
        products: {
            // Populated lazily via getter to avoid self-referential initialisation
            get nodes() { return MOCK_PRODUCTS.filter(p => p.collections.nodes.some(c => c.handle === "magical-stationery")); },
            pageInfo: {hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null},
        },
    },
    {
        id: "gid://shopify/Collection/library-collection",
        handle: "library-collection",
        title: "Library Collection",
        description: "Essential titles from the Hogwarts library \u2014 required reading for any witch or wizard.",
        seo: {title: "Library Collection", description: "Essential titles from the Hogwarts library \u2014 required reading for any witch or wizard."},
        image: img("library-collection-cover", `${IMG_BASE}/hogwarts_a_history_library_collection_1.avif`, "Library Collection"),
        products: {
            // Populated lazily via getter to avoid self-referential initialisation
            get nodes() { return MOCK_PRODUCTS.filter(p => p.collections.nodes.some(c => c.handle === "library-collection")); },
            pageInfo: {hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null},
        },
    },
    {
        id: "gid://shopify/Collection/wands",
        handle: "wands",
        title: "Wands",
        description: "Replica wands crafted to match those wielded by the most iconic characters in the wizarding world.",
        seo: {title: "Wands", description: "Replica wands crafted to match those wielded by the most iconic characters in the wizarding world."},
        image: img("wands-cover", `${IMG_BASE}/harry_potters_wand_wands_1.avif`, "Wands"),
        products: {
            // Populated lazily via getter to avoid self-referential initialisation
            get nodes() { return MOCK_PRODUCTS.filter(p => p.collections.nodes.some(c => c.handle === "wands")); },
            pageInfo: {hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null},
        },
    },
    {
        id: "gid://shopify/Collection/potion-ingredients",
        handle: "potion-ingredients",
        title: "Potion Ingredients",
        description: "Authentic-looking potion ingredients and flasks for the aspiring potioneer.",
        seo: {title: "Potion Ingredients", description: "Authentic-looking potion ingredients and flasks for the aspiring potioneer."},
        image: img("potion-ingredients-cover", `${IMG_BASE}/amortentia_vial_potion_ingredients_1.avif`, "Potion Ingredients"),
        products: {
            // Populated lazily via getter to avoid self-referential initialisation
            get nodes() { return MOCK_PRODUCTS.filter(p => p.collections.nodes.some(c => c.handle === "potion-ingredients")); },
            pageInfo: {hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null},
        },
    },
];

// =============================================================================
// PUBLIC QUERY API
//
// These helpers are consumed by app/lib/data-source.ts mock operation handlers.
// All functions are synchronous — no await needed.
// =============================================================================

/**
 * Fetch a single product by URL handle.
 * Returns undefined for unknown handles — callers should throw a 404 Response.
 */
export function getMockProductByHandle(handle: string): MockProduct | undefined {
    return MOCK_PRODUCTS.find(p => p.handle === handle);
}

/**
 * All products as a flat array.
 * Satisfies ProductItemFragment — suitable for /collections/all-products.
 */
export function getMockAllProducts(): MockProduct[] {
    return MOCK_PRODUCTS;
}

/**
 * A subset of products for homepage featured sections.
 * Prioritises available products; falls back to full list if fewer than `count` are available.
 *
 * @param count - Maximum number of products to return (default 8)
 */
export function getMockFeaturedProducts(count = 8): MockProduct[] {
    const available = MOCK_PRODUCTS.filter(p => p.availableForSale);
    const pool = available.length >= count ? available : MOCK_PRODUCTS;
    return pool.slice(0, count);
}

/**
 * All collections — suitable for the /collections index page.
 */
export function getMockCollections(): MockCollection[] {
    return MOCK_COLLECTIONS;
}

/**
 * Fetch a single collection by handle.
 * Returns undefined for unknown handles — callers should throw a 404 Response.
 */
export function getMockCollectionByHandle(handle: string): MockCollection | undefined {
    return MOCK_COLLECTIONS.find(c => c.handle === handle);
}

/**
 * Products within a specific collection.
 * Returns an empty array for unknown handles rather than throwing.
 */
export function getMockProductsByCollection(collectionHandle: string): MockProduct[] {
    return MOCK_PRODUCTS.filter(p =>
        p.collections.nodes.some(c => c.handle === collectionHandle)
    );
}

/**
 * Tabbed collection data for the CuratedCollections homepage component.
 * Returns one tab per collection sorted by product count (richest first).
 */
export function getMockCuratedCollectionTabs(): MockCuratedTab[] {
    return MOCK_COLLECTIONS
        .map(col => ({
            title: col.title,
            handle: col.handle,
            products: col.products.nodes,
        }))
        .filter(tab => tab.products.length > 0)
        .sort((a, b) => b.products.length - a.products.length);
}

/**
 * Collection list with per-collection product counts for CollectionSidebar.
 * Includes an "All Products" entry prepended at index 0.
 */
export function getMockCollectionsWithCounts(): MockCollectionWithCount[] {
    const available = MOCK_PRODUCTS.filter(p => p.availableForSale);
    const byColl: MockCollectionWithCount[] = MOCK_COLLECTIONS.map(col => ({
        handle: col.handle,
        title: col.title,
        productsCount: col.products.nodes.filter(p => p.availableForSale).length,
    })).filter(c => c.productsCount > 0);
    return [
        {handle: "all-products", title: "All Products", productsCount: available.length},
        ...byColl,
    ];
}

/**
 * Total count of available products — used by the "All" sidebar link.
 */
export function getMockTotalProductCount(): number {
    return MOCK_PRODUCTS.filter(p => p.availableForSale).length;
}

/**
 * Count of products that have a compareAtPrice higher than their regular price.
 * Used by the "Sale" sidebar badge.
 */
export function getMockDiscountedProductCount(): number {
    return MOCK_PRODUCTS.filter(p => {
        const compare = parseFloat(p.compareAtPriceRange.minVariantPrice.amount);
        const regular = parseFloat(p.priceRange.minVariantPrice.amount);
        return compare > regular;
    }).length;
}
