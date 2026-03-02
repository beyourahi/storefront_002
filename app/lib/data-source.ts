import {
    getMockAllProducts,
    getMockCollectionByHandle,
    getMockCollections,
    getMockProductByHandle,
    type MockProduct
} from "~/lib/fallback-data";

export type FallbackReason = "missing_env_vars" | "invalid_env_vars";
export type DataAdapterSource = "shopify" | "mock";

export interface DataAdapter {
    readonly source: DataAdapterSource;
    readonly fallbackReason: FallbackReason | null;
    query<T = any>(query: string, options?: {variables?: Record<string, unknown>; cache?: any}): Promise<T>;
    CacheNone(): any;
    CacheLong(): any;
    CacheShort(): any;
}

type StorefrontLike = {
    query<T = any>(query: string, options?: {variables?: Record<string, unknown>; cache?: any}): Promise<T>;
    CacheNone(): any;
    CacheLong(): any;
    CacheShort(): any;
};

type EnvLike = {
    PUBLIC_STORE_DOMAIN?: string;
    PUBLIC_STOREFRONT_API_TOKEN?: string;
};

type MockOperationHandler = (variables: Record<string, unknown>) => any;

const DEFAULT_MENU_HANDLE = "main-menu";
const DEFAULT_FOOTER_MENU_HANDLE = "footer";
const DEFAULT_PRIMARY_DOMAIN = "https://example.myshopify.com";
const DEFAULT_STORE_NAME = "Mock Store";

const MOCK_ICON_192 = "https://dummyimage.com/192x192/111827/ffffff.png&text=Store";
const MOCK_ICON_512 = "https://dummyimage.com/512x512/111827/ffffff.png&text=Store";
const MOCK_ICON_180 = "https://dummyimage.com/180x180/111827/ffffff.png&text=Store";

const MOCK_POLICIES = {
    privacyPolicy: {
        id: "gid://shopify/ShopPolicy/privacy",
        handle: "privacy-policy",
        title: "Privacy Policy",
        url: "/policies/privacy-policy",
        body: "<p>This is a mock privacy policy for local development.</p>"
    },
    shippingPolicy: {
        id: "gid://shopify/ShopPolicy/shipping",
        handle: "shipping-policy",
        title: "Shipping Policy",
        url: "/policies/shipping-policy",
        body: "<p>This is a mock shipping policy for local development.</p>"
    },
    termsOfService: {
        id: "gid://shopify/ShopPolicy/terms",
        handle: "terms-of-service",
        title: "Terms of Service",
        url: "/policies/terms-of-service",
        body: "<p>This is a mock terms of service policy for local development.</p>"
    },
    refundPolicy: {
        id: "gid://shopify/ShopPolicy/refund",
        handle: "refund-policy",
        title: "Refund Policy",
        url: "/policies/refund-policy",
        body: "<p>This is a mock refund policy for local development.</p>"
    }
} as const;

const MOCK_PAGES = [
    {
        __typename: "Page",
        id: "gid://shopify/Page/mock-page-1",
        title: "Shipping Information",
        handle: "shipping-information",
        trackingParameters: ""
    }
] as const;

const DOMAIN_PATTERN = /^(?!https?:\/\/)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
const TOKEN_PATTERN = /^[A-Za-z0-9_=-]{20,}$/;

export function createDataAdapter(storefront: StorefrontLike, env: EnvLike): DataAdapter {
    const validation = validateShopifyEnv(env);

    if (validation.valid) {
        return createShopifyAdapter(storefront);
    }

    logFallback(validation.reason);
    return createMockAdapter(validation.reason);
}

function validateShopifyEnv(env: EnvLike):
    | {valid: true; reason: null}
    | {valid: false; reason: FallbackReason} {
    const domain = env.PUBLIC_STORE_DOMAIN?.trim();
    const token = env.PUBLIC_STOREFRONT_API_TOKEN?.trim();

    if (!domain || !token) {
        return {valid: false, reason: "missing_env_vars"};
    }

    if (!DOMAIN_PATTERN.test(domain) || !TOKEN_PATTERN.test(token)) {
        return {valid: false, reason: "invalid_env_vars"};
    }

    return {valid: true, reason: null};
}

function createShopifyAdapter(storefront: StorefrontLike): DataAdapter {
    return {
        source: "shopify",
        fallbackReason: null,
        query: (query, options) => storefront.query(query, options),
        CacheNone: () => storefront.CacheNone(),
        CacheLong: () => storefront.CacheLong(),
        CacheShort: () => storefront.CacheShort()
    };
}

function createMockAdapter(reason: FallbackReason): DataAdapter {
    return {
        source: "mock",
        fallbackReason: reason,
        async query<T = any>(query: string, options?: {variables?: Record<string, unknown>; cache?: any}): Promise<T> {
            const operationName = extractOperationName(query);
            const variables = options?.variables ?? {};

            if (!operationName) {
                logUnmappedOperation("unknown_operation");
                return {} as T;
            }

            const handler = MOCK_OPERATION_MAP[operationName];
            if (!handler) {
                logUnmappedOperation(operationName);
                return {} as T;
            }

            return handler(variables) as T;
        },
        CacheNone: () => undefined,
        CacheLong: () => undefined,
        CacheShort: () => undefined
    };
}

function extractOperationName(query: string): string | null {
    const match = query.match(/\b(?:query|mutation)\s+(\w+)/);
    return match?.[1] ?? null;
}

function logFallback(reason: FallbackReason): void {
    if (!import.meta.env.DEV) {
        return;
    }

    console.warn(`[DataAdapter] Falling back to mock data (${reason})`);
}

function logUnmappedOperation(operationName: string): void {
    if (!import.meta.env.DEV) {
        return;
    }

    console.warn(`[DataAdapter] No mock handler for operation: ${operationName}`);
}

function getVariableString(variables: Record<string, unknown>, key: string, fallback = ""): string {
    const value = variables[key];
    return typeof value === "string" ? value : fallback;
}

function getVariableNumber(variables: Record<string, unknown>, key: string, fallback: number): number {
    const value = variables[key];
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const parsed = Number.parseInt(value, 10);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return fallback;
}

function getVariableIds(variables: Record<string, unknown>): string[] {
    const ids = variables.ids;
    if (!Array.isArray(ids)) {
        return [];
    }

    return ids.filter((id): id is string => typeof id === "string");
}

function getMockProducts(): MockProduct[] {
    return getMockAllProducts();
}

function getAvailableMockProducts(): MockProduct[] {
    return getMockProducts().filter(product => product.availableForSale);
}

function getDiscountedMockProducts(): MockProduct[] {
    return getMockProducts().filter(product =>
        product.variants.nodes.some(variant => {
            if (!variant.availableForSale || !variant.compareAtPrice) {
                return false;
            }

            return Number.parseFloat(variant.compareAtPrice.amount) > Number.parseFloat(variant.price.amount);
        })
    );
}

function limitNodes<T>(nodes: T[], variables: Record<string, unknown>, defaultFirst = 250): T[] {
    const first = getVariableNumber(variables, "first", defaultFirst);
    return nodes.slice(0, Math.max(first, 0));
}

function mockPaginatedProducts(products: MockProduct[], variables: Record<string, unknown>, defaultFirst = 250) {
    return {
        nodes: limitNodes(products, variables, defaultFirst),
        pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null
        }
    };
}

function mockCollectionsPageInfo() {
    return {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null
    };
}

function buildMockMenuItem(collection: {id: string; handle: string; title: string}) {
    return {
        id: `menu-item-${collection.handle}`,
        resourceId: collection.id,
        tags: [],
        title: collection.title,
        type: "COLLECTION",
        url: `/collections/${collection.handle}`,
        items: []
    };
}

function buildMockMenu(handle: string) {
    const collections = getMockCollections().slice(0, 10);
    return {
        id: `gid://shopify/Menu/${handle}`,
        items: collections.map(buildMockMenuItem)
    };
}

function buildMockShop() {
    const firstProduct = getMockProducts()[0];
    const imageUrl = firstProduct?.featuredImage?.url ?? MOCK_ICON_512;

    return {
        id: "gid://shopify/Shop/mock-shop",
        name: DEFAULT_STORE_NAME,
        description: "Mock storefront data adapter mode",
        primaryDomain: {
            url: DEFAULT_PRIMARY_DOMAIN
        },
        brand: {
            logo: {image: {url: imageUrl, width: 512, height: 512}},
            squareLogo: {image: {url: imageUrl, width: 512, height: 512}},
            coverImage: {image: {url: imageUrl, width: 1200, height: 630}},
            shortDescription: "Mock storefront",
            slogan: "Build fast without Shopify credentials",
            colors: {
                primary: [{background: "#111827", foreground: "#ffffff"}],
                secondary: [{background: "#f3f4f6", foreground: "#111827"}]
            }
        },
        freeShippingThreshold: {
            value: "5000",
            type: "number_integer"
        },
        privacyPolicy: MOCK_POLICIES.privacyPolicy,
        shippingPolicy: MOCK_POLICIES.shippingPolicy,
        termsOfService: MOCK_POLICIES.termsOfService,
        refundPolicy: MOCK_POLICIES.refundPolicy
    };
}

function buildMockSiteSettingsMetaobject() {
    return {
        id: "gid://shopify/Metaobject/site_settings/main",
        handle: "main",
        brandName: {value: DEFAULT_STORE_NAME},
        brandWords: {value: JSON.stringify(["bold", "crafted", "timeless"])},
        missionStatement: {value: "Designed for seamless local development."},
        heroHeading: {value: "Mock Storefront"},
        heroDescription: {value: "This storefront is running with local mock data."},
        siteUrl: {value: DEFAULT_PRIMARY_DOMAIN},
        defaultSeoTitle: {value: DEFAULT_STORE_NAME},
        defaultSeoDescription: {value: "Mock storefront SEO description."},
        announcementBanner: {value: JSON.stringify(["Mock mode enabled"])},
        socialLinksData: {
            value: JSON.stringify([
                {text: "Instagram", url: "https://instagram.com/mock-store"},
                {text: "Facebook", url: "https://facebook.com/mock-store"}
            ])
        },
        testimonialsData: {
            value: JSON.stringify([
                {
                    customerName: "Mock Customer",
                    location: "Local",
                    rating: 5,
                    text: "Great mock experience."
                }
            ])
        },
        faqItemsData: {
            value: JSON.stringify([
                {
                    question: "Is this live data?",
                    answer: "No, this is mock data generated by the DataAdapter."
                }
            ])
        },
        favicon: {
            reference: {
                __typename: "MediaImage",
                image: {url: MOCK_ICON_192}
            }
        },
        icon192: {
            reference: {
                __typename: "MediaImage",
                image: {url: MOCK_ICON_192, altText: "Mock icon 192", width: 192, height: 192}
            }
        },
        icon512: {
            reference: {
                __typename: "MediaImage",
                image: {url: MOCK_ICON_512, altText: "Mock icon 512", width: 512, height: 512}
            }
        },
        icon180Apple: {
            reference: {
                __typename: "MediaImage",
                image: {url: MOCK_ICON_180, altText: "Mock icon apple", width: 180, height: 180}
            }
        }
    };
}

function buildMockPwaSettingsMetaobject() {
    return {
        iconApple: {
            reference: {
                __typename: "MediaImage",
                image: {url: MOCK_ICON_180}
            }
        },
        icon192: {
            reference: {
                __typename: "MediaImage",
                image: {url: MOCK_ICON_192}
            }
        }
    };
}

function buildMockThemeSettingsMetaobject() {
    return {
        id: "gid://shopify/Metaobject/theme_settings/main",
        handle: "main",
        fontBody: {value: "Inter"},
        fontHeading: {value: "Playfair Display"},
        fontPrice: {value: "JetBrains Mono"},
        colorPrimary: {value: "#111827"},
        colorSecondary: {value: "#6b7280"},
        colorBackground: {value: "#ffffff"},
        colorForeground: {value: "#111827"},
        colorAccent: {value: "#ec4899"}
    };
}

function buildMockPolicyResponse(variables: Record<string, unknown>) {
    const shop: Record<string, unknown> = {};

    const includeKey = (key: keyof typeof MOCK_POLICIES) => {
        if (variables[key] === true || !(key in variables)) {
            shop[key] = MOCK_POLICIES[key];
        }
    };

    includeKey("privacyPolicy");
    includeKey("shippingPolicy");
    includeKey("termsOfService");
    includeKey("refundPolicy");

    return {shop};
}

function toArticleId(index: number): string {
    return `gid://shopify/Article/mock-${index + 1}`;
}

function buildMockArticles() {
    const products = getAvailableMockProducts().slice(0, 8);

    if (products.length === 0) {
        return [];
    }

    return products.map((product, index) => ({
        __typename: "Article",
        id: toArticleId(index),
        handle: `mock-article-${index + 1}`,
        title: `${product.title} Story`,
        excerpt: `A closer look at ${product.title}.`,
        excerptHtml: `<p>A closer look at ${product.title}.</p>`,
        content: `${product.title} is featured in our latest mock editorial series.`,
        contentHtml: `<p>${product.title} is featured in our latest mock editorial series.</p>`,
        publishedAt: new Date(Date.now() - index * 86400000).toISOString(),
        tags: ["mock", "editorial"],
        trackingParameters: "",
        image: product.featuredImage,
        blog: {
            handle: index % 2 === 0 ? "journal" : "news",
            title: index % 2 === 0 ? "Journal" : "News"
        },
        author: {
            name: "Mock Author",
            bio: "Mock author biography",
            firstName: "Mock",
            lastName: "Author"
        },
        seo: {
            title: `${product.title} Story`,
            description: `A closer look at ${product.title}.`
        }
    }));
}

function buildMockBlogs() {
    const articles = buildMockArticles();

    const journalArticles = articles.filter(article => article.blog.handle === "journal");
    const newsArticles = articles.filter(article => article.blog.handle === "news");

    return [
        {
            title: "Journal",
            handle: "journal",
            seo: {
                title: "Journal",
                description: "Mock journal entries"
            },
            articles: {
                nodes: journalArticles,
                pageInfo: mockCollectionsPageInfo()
            }
        },
        {
            title: "News",
            handle: "news",
            seo: {
                title: "News",
                description: "Mock news updates"
            },
            articles: {
                nodes: newsArticles,
                pageInfo: mockCollectionsPageInfo()
            }
        }
    ];
}

function resolveProductByRequestedId(requestedId: string, index = 0): MockProduct | null {
    const products = getMockProducts();

    const byExactId = products.find(product => product.id === requestedId);
    if (byExactId) {
        return byExactId;
    }

    const numericMatch = requestedId.match(/^gid:\/\/shopify\/Product\/(\d+)$/);
    if (numericMatch) {
        const numericId = Number.parseInt(numericMatch[1], 10);
        if (Number.isFinite(numericId) && products.length > 0) {
            return products[(numericId - 1) % products.length] ?? null;
        }
    }

    return products[index % products.length] ?? null;
}

function mockNodesByIds(ids: string[]): Array<MockProduct | null> {
    return ids.map((id, index) => {
        const product = resolveProductByRequestedId(id, index);
        if (!product) {
            return null;
        }

        if (product.id === id) {
            return product;
        }

        return {
            ...product,
            id
        };
    });
}

function buildMockCollectionsWithProducts() {
    const collections = getMockCollections();

    return collections.map(collection => ({
        ...collection,
        products: {
            nodes: collection.products.nodes.filter(product => product.availableForSale),
            pageInfo: collection.products.pageInfo
        }
    }));
}

function mockSidebarResponse() {
    const collections = buildMockCollectionsWithProducts().map(collection => ({
        id: collection.id,
        handle: collection.handle,
        title: collection.title,
        products: {
            nodes: collection.products.nodes.map(product => ({
                id: product.id,
                availableForSale: product.availableForSale
            }))
        }
    }));

    const allProducts = getMockProducts();

    return {
        collections: {nodes: collections},
        allProducts: {
            nodes: allProducts
        }
    };
}

function buildCollectionResponse(handle: string | null, variables: Record<string, unknown>) {
    const collection = handle ? getMockCollectionByHandle(handle) : null;
    if (!collection) {
        return {collection: null};
    }

    const products = collection.products.nodes;

    return {
        collection: {
            ...collection,
            products: mockPaginatedProducts(products, variables)
        }
    };
}

function filterProductsByTerm(term: string): MockProduct[] {
    if (!term.trim()) {
        return getAvailableMockProducts();
    }

    const normalized = term.trim().toLowerCase();
    return getAvailableMockProducts().filter(product => {
        const haystack = [
            product.title,
            product.handle,
            product.description,
            product.vendor,
            product.tags.join(" "),
            ...product.collections.nodes.map(collection => collection.title)
        ]
            .join(" ")
            .toLowerCase();

        return haystack.includes(normalized);
    });
}

function filterArticlesByTerm(term: string) {
    const articles = buildMockArticles();
    if (!term.trim()) {
        return articles;
    }

    const normalized = term.trim().toLowerCase();
    return articles.filter(article => {
        const haystack = `${article.title} ${article.excerpt} ${(article.tags ?? []).join(" ")}`.toLowerCase();
        return haystack.includes(normalized);
    });
}

function filterCollectionsByQuery(query: string) {
    const collections = getMockCollections();

    const normalized = query
        .replace(/^title:/i, "")
        .replace(/\*+$/g, "")
        .trim()
        .toLowerCase();

    if (!normalized) {
        return collections;
    }

    return collections.filter(collection => collection.title.toLowerCase().includes(normalized));
}

const MOCK_OPERATION_MAP: Record<string, MockOperationHandler> = {
    Header: variables => ({
        shop: buildMockShop(),
        menu: buildMockMenu(getVariableString(variables, "headerMenuHandle", DEFAULT_MENU_HANDLE))
    }),
    Footer: variables => ({
        menu: buildMockMenu(getVariableString(variables, "footerMenuHandle", DEFAULT_FOOTER_MENU_HANDLE))
    }),
    MenuCollections: variables => ({
        collections: {nodes: buildMockCollectionsWithProducts()},
        allProducts: {
            nodes: limitNodes(getMockProducts(), variables, 250)
        }
    }),
    ShopShippingConfig: () => ({
        shop: {
            freeShippingThreshold: {
                value: "5000",
                type: "number_integer"
            }
        }
    }),
    ThemeSettings: () => ({
        themeSettings: buildMockThemeSettingsMetaobject()
    }),
    SiteContent: () => ({
        siteSettings: buildMockSiteSettingsMetaobject()
    }),
    PwaManifest: () => ({
        siteSettings: buildMockSiteSettingsMetaobject(),
        themeSettings: buildMockThemeSettingsMetaobject(),
        shop: buildMockShop()
    }),
    Favicon: () => ({
        siteSettings: buildMockSiteSettingsMetaobject(),
        shop: buildMockShop()
    }),
    AppleTouchIcon: () => ({
        siteSettings: buildMockSiteSettingsMetaobject(),
        pwaSettings: buildMockPwaSettingsMetaobject(),
        shop: buildMockShop()
    }),
    StoreRobots: () => ({
        shop: {id: "gid://shopify/Shop/1"}
    }),
    HasBlog: () => ({
        articles: {
            nodes: buildMockArticles().slice(0, 1).map(article => ({id: article.id}))
        }
    }),
    PolicyAvailability: () => ({
        shop: {
            privacyPolicy: {id: MOCK_POLICIES.privacyPolicy.id},
            termsOfService: {id: MOCK_POLICIES.termsOfService.id},
            shippingPolicy: {id: MOCK_POLICIES.shippingPolicy.id},
            refundPolicy: {id: MOCK_POLICIES.refundPolicy.id}
        }
    }),
    PolicyContent: variables => buildMockPolicyResponse(variables),
    Policy: variables => buildMockPolicyResponse(variables),
    ExploreCollections: variables => ({
        collections: {
            nodes: limitNodes(buildMockCollectionsWithProducts(), variables, 5)
        }
    }),
    HeroCollections: variables => ({
        collections: {
            nodes: limitNodes(buildMockCollectionsWithProducts(), variables, 50)
        }
    }),
    CuratedCollections: variables => ({
        collections: {
            nodes: limitNodes(buildMockCollectionsWithProducts(), variables, 20)
        }
    }),
    CollectionWithProducts: variables => {
        const handle = getVariableString(variables, "handle");
        const collection = getMockCollectionByHandle(handle);

        if (!collection) {
            return {collection: null};
        }

        return {
            collection: {
                ...collection,
                products: mockPaginatedProducts(collection.products.nodes, variables, 6)
            }
        };
    },
    Collection: variables => buildCollectionResponse(getVariableString(variables, "handle"), variables),
    CollectionsPage: variables => ({
        collections: {nodes: limitNodes(buildMockCollectionsWithProducts(), variables, 250)},
        allProducts: {nodes: limitNodes(getMockProducts(), variables, 250)}
    }),
    StoreCollections: variables => ({
        collections: {
            nodes: limitNodes(buildMockCollectionsWithProducts(), variables, 24),
            pageInfo: mockCollectionsPageInfo()
        }
    }),
    Catalog: variables => ({
        products: mockPaginatedProducts(getMockProducts(), variables, 250)
    }),
    AllProducts: variables => ({
        products: mockPaginatedProducts(getMockProducts(), variables, 250)
    }),
    AllProductsForDashboard: variables => ({
        products: mockPaginatedProducts(getMockProducts(), variables, 250)
    }),
    SalePageProducts: variables => ({
        products: mockPaginatedProducts(getDiscountedMockProducts(), variables, 250)
    }),
    DiscountsPage: variables => ({
        products: mockPaginatedProducts(getDiscountedMockProducts(), variables, 250)
    }),
    SaleProducts: variables => ({
        products: {
            nodes: limitNodes(getDiscountedMockProducts(), variables, 250)
        }
    }),
    SidebarCollectionsProduct: () => mockSidebarResponse(),
    SidebarCollectionsHandle: () => mockSidebarResponse(),
    SidebarCollectionsAll: () => mockSidebarResponse(),
    SidebarCollectionsForDiscounts: () => mockSidebarResponse(),
    Product: variables => ({
        product: getMockProductByHandle(getVariableString(variables, "handle")) ?? null
    }),
    ProductByHandle: variables => ({
        product: getMockProductByHandle(getVariableString(variables, "handle")) ?? null
    }),
    ProductRecommendations: variables => {
        const productId = getVariableString(variables, "productId");
        const products = getAvailableMockProducts();
        const related = products.filter(product => product.id !== productId).slice(0, 12);

        return {
            productRecommendations: related
        };
    },
    ProductPageRecommendations: variables => {
        const productId = getVariableString(variables, "productId");
        const products = getAvailableMockProducts();
        return {
            productRecommendations: products.filter(product => product.id !== productId).slice(0, 8)
        };
    },
    RecommendedProducts: () => ({
        products: {
            nodes: getAvailableMockProducts().slice(0, 12)
        }
    }),
    CartSuggestions: () => ({
        products: {
            nodes: getAvailableMockProducts().slice(0, 16)
        }
    }),
    ProductHandles: variables => ({
        nodes: mockNodesByIds(getVariableIds(variables)).map(node =>
            node ? {__typename: "Product", id: node.id, handle: node.handle} : null
        )
    }),
    OrderProductHandles: variables => ({
        nodes: mockNodesByIds(getVariableIds(variables)).map(node =>
            node ? {__typename: "Product", id: node.id, handle: node.handle} : null
        )
    }),
    HomeRecentlyViewedProducts: variables => ({
        nodes: mockNodesByIds(getVariableIds(variables)).map(node =>
            node ? {__typename: "Product", ...node} : null
        )
    }),
    AccountRecentlyViewedProducts: variables => ({
        nodes: mockNodesByIds(getVariableIds(variables)).map(node =>
            node ? {__typename: "Product", ...node} : null
        )
    }),
    WishlistProducts: variables => ({
        nodes: mockNodesByIds(getVariableIds(variables)).map(node =>
            node ? {__typename: "Product", ...node} : null
        )
    }),
    SharedWishlist: variables => ({
        nodes: mockNodesByIds(getVariableIds(variables)).map(node =>
            node ? {__typename: "Product", ...node} : null
        )
    }),
    SharedWishlistProducts: variables => ({
        nodes: mockNodesByIds(getVariableIds(variables)).map(node =>
            node ? {__typename: "Product", ...node} : null
        )
    }),
    GalleryProducts: variables => ({
        products: {
            nodes: limitNodes(getAvailableMockProducts(), variables, 250).map(product => ({
                handle: product.handle,
                title: product.title,
                collections: {
                    nodes: product.collections.nodes.slice(0, 1)
                },
                images: {
                    nodes: product.images.nodes
                }
            }))
        }
    }),
    BlogsWithArticles: variables => ({
        blogs: {
            nodes: limitNodes(buildMockBlogs(), variables, 10),
            pageInfo: mockCollectionsPageInfo()
        }
    }),
    LatestArticles: variables => ({
        articles: {
            nodes: limitNodes(buildMockArticles(), variables, 1)
        }
    }),
    HomepageBlogArticles: variables => ({
        articles: {
            nodes: limitNodes(buildMockArticles(), variables, 6)
        }
    }),
    RecentBlogArticles: () => ({
        blogs: {
            nodes: buildMockBlogs().map(blog => ({
                articles: {
                    nodes: blog.articles.nodes.slice(0, 2)
                }
            }))
        }
    }),
    Blog: variables => {
        const handle = getVariableString(variables, "blogHandle", "journal");
        const tagQuery = getVariableString(variables, "tagQuery");
        const blogs = buildMockBlogs();
        const blog = blogs.find(item => item.handle === handle) ?? blogs[0] ?? null;

        if (!blog) {
            return {blog: null};
        }

        const filteredArticles = tagQuery
            ? blog.articles.nodes.filter(article => article.tags.includes(tagQuery.replace(/^tag:/, "")))
            : blog.articles.nodes;

        return {
            blog: {
                ...blog,
                articles: {
                    nodes: filteredArticles,
                    pageInfo: mockCollectionsPageInfo()
                }
            }
        };
    },
    Article: variables => {
        const blogHandle = getVariableString(variables, "blogHandle", "journal");
        const articleHandle = getVariableString(variables, "articleHandle");
        const blogs = buildMockBlogs();
        const blog = blogs.find(item => item.handle === blogHandle) ?? blogs[0] ?? null;

        if (!blog) {
            return {blog: null};
        }

        const articleByHandle = blog.articles.nodes.find(article => article.handle === articleHandle) ?? null;

        return {
            blog: {
                ...blog,
                articleByHandle,
                articles: {
                    nodes: blog.articles.nodes
                }
            }
        };
    },
    SearchCollections: variables => {
        const query = getVariableString(variables, "query");
        const collections = filterCollectionsByQuery(query).map(collection => ({
            __typename: "Collection",
            id: collection.id,
            handle: collection.handle,
            title: collection.title,
            description: collection.description,
            image: collection.image,
            products: {
                nodes: collection.products.nodes
                    .filter(product => product.availableForSale)
                    .slice(0, 1)
                    .map(product => ({id: product.id, availableForSale: product.availableForSale}))
            }
        }));

        return {
            collections: {
                nodes: collections,
                totalCount: collections.length
            }
        };
    },
    RegularSearch: variables => {
        const term = getVariableString(variables, "term");
        const products = filterProductsByTerm(term).map(product => ({__typename: "Product", ...product}));
        const articles = filterArticlesByTerm(term);

        return {
            products: {
                nodes: products,
                pageInfo: {
                    hasNextPage: false,
                    endCursor: null
                },
                totalCount: products.length
            },
            articles: {
                nodes: articles,
                pageInfo: {
                    hasNextPage: false,
                    endCursor: null
                },
                totalCount: articles.length
            }
        };
    },
    SearchProducts: variables => {
        const term = getVariableString(variables, "term");
        const products = filterProductsByTerm(term).map(product => ({__typename: "Product", ...product}));

        return {
            products: {
                nodes: products,
                pageInfo: {
                    hasNextPage: false,
                    endCursor: null
                }
            }
        };
    },
    SearchArticles: variables => {
        const term = getVariableString(variables, "term");
        const articles = filterArticlesByTerm(term);

        return {
            articles: {
                nodes: articles,
                pageInfo: {
                    hasNextPage: false,
                    endCursor: null
                }
            }
        };
    },
    PredictiveSearch: variables => {
        const term = getVariableString(variables, "term");
        const products = filterProductsByTerm(term)
            .slice(0, getVariableNumber(variables, "limit", 10))
            .map(product => ({
                __typename: "Product",
                id: product.id,
                title: product.title,
                handle: product.handle,
                availableForSale: product.availableForSale,
                trackingParameters: "",
                selectedOrFirstAvailableVariant: product.selectedOrFirstAvailableVariant
                    ? {
                          id: product.selectedOrFirstAvailableVariant.id,
                          image: product.selectedOrFirstAvailableVariant.image,
                          price: product.selectedOrFirstAvailableVariant.price,
                          compareAtPrice: product.selectedOrFirstAvailableVariant.compareAtPrice
                      }
                    : null
            }));

        const collections = filterCollectionsByQuery(term)
            .slice(0, getVariableNumber(variables, "limit", 10))
            .map(collection => ({
                __typename: "Collection",
                id: collection.id,
                title: collection.title,
                handle: collection.handle,
                image: collection.image,
                trackingParameters: "",
                products: {
                    nodes: collection.products.nodes
                        .filter(product => product.availableForSale)
                        .slice(0, 1)
                        .map(product => ({id: product.id, availableForSale: product.availableForSale}))
                }
            }));

        const articles = filterArticlesByTerm(term)
            .slice(0, getVariableNumber(variables, "limit", 10))
            .map(article => ({
                __typename: "Article",
                id: article.id,
                title: article.title,
                handle: article.handle,
                blog: {handle: article.blog.handle},
                image: article.image,
                trackingParameters: ""
            }));

        return {
            predictiveSearch: {
                products,
                collections,
                articles,
                pages: MOCK_PAGES,
                queries: term
                    ? [
                          {
                              __typename: "SearchQuerySuggestion",
                              text: term,
                              styledText: term,
                              trackingParameters: ""
                          }
                      ]
                    : []
            }
        };
    }
};
