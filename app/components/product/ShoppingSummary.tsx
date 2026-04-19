import {Suspense} from "react";
import {Await, useRouteLoaderData} from "react-router";
import {ShoppingCart} from "lucide-react";
import {Skeleton} from "~/components/ui/skeleton";
import {Spinner} from "~/components/ui/spinner";
import type {RootLoader} from "~/root";
import {parseProductTitle} from "~/lib/product";
import {formatPrice} from "~/lib/currency-formatter";

type ShoppingSummaryProps = {
    product: any;
    selectedVariant: any;
    quantity: number;
    isLoading?: boolean;
    isVariantTransitioning?: boolean;
};

const SummaryContent = ({
    product,
    selectedVariant,
    quantity,
    isVariantTransitioning,
    cart
}: {
    product: any;
    selectedVariant: any;
    quantity: number;
    isVariantTransitioning?: boolean;
    cart: any;
}) => {
    if (!selectedVariant?.price) {
        if (isVariantTransitioning) {
            return (
                <div className="flex flex-col items-center justify-center gap-2 py-4">
                    <Spinner />
                    <span className="text-muted-foreground text-sm">Updating price...</span>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center py-4">
                <span className="text-muted-foreground text-sm">Select options to see total</span>
            </div>
        );
    }

    const unitPrice = parseFloat(selectedVariant.price.amount);
    if (isNaN(unitPrice) || unitPrice < 0) {
        return (
            <div className="flex items-center justify-center py-4">
                <span className="text-muted-foreground text-sm">Price unavailable for this selection</span>
            </div>
        );
    }

    const currencyCode = selectedVariant.price.currencyCode || "USD";
    const totalPrice = unitPrice * quantity;

    const unitComparePrice = selectedVariant.compareAtPrice?.amount
        ? parseFloat(selectedVariant.compareAtPrice.amount)
        : null;
    const totalComparePrice = unitComparePrice ? unitComparePrice * quantity : null;

    const isOnSale = totalComparePrice !== null && totalComparePrice > totalPrice;
    const totalSavings = isOnSale ? totalComparePrice - totalPrice : 0;
    const savingsPercentage = isOnSale ? Math.round((totalSavings / totalComparePrice) * 100) : 0;

    const cartItemCount = cart?.totalQuantity ?? 0;
    const cartTotalAmount = cart?.cost?.totalAmount ? parseFloat(cart.cost.totalAmount.amount) : 0;
    const cartCurrencyCode = cart?.cost?.totalAmount?.currencyCode || currencyCode;
    const hasExistingCart = cartItemCount > 0;
    const newCartTotal = cartTotalAmount + totalPrice;

    return (
        <>
            <div className="space-y-2 text-sm">
                {hasExistingCart && (
                    <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">
                            Current cart ({cartItemCount} {cartItemCount === 1 ? "item" : "items"})
                        </span>
                        <span className="font-mono font-medium">{formatPrice(cartTotalAmount, cartCurrencyCode)}</span>
                    </div>
                )}

                <div className="flex items-start justify-between py-1">
                    <div className="flex items-center gap-1">
                        <div className="flex flex-col">
                            {(() => {
                                const {primary, secondary} = parseProductTitle(product.title);
                                return (
                                    <>
                                        <span className="text-foreground">Adding: {primary}</span>
                                        {secondary && <span className="opacity-50 text-xs">{secondary}</span>}
                                    </>
                                );
                            })()}
                            <span className="text-muted-foreground text-xs">Quantity: {quantity}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        {isOnSale && totalComparePrice && (
                            <span className="text-muted-foreground font-mono text-xs line-through">
                                {formatPrice(totalComparePrice, currencyCode)}
                            </span>
                        )}
                        <span className="font-mono font-medium">{formatPrice(totalPrice, currencyCode)}</span>
                    </div>
                </div>

                {isOnSale && totalSavings > 0 && (
                    <div className="text-sale-text flex items-center justify-between py-1">
                        <span className="text-xs">You save</span>
                        <span className="font-mono text-xs font-medium">
                            -{formatPrice(totalSavings, currencyCode)} ({savingsPercentage}%)
                        </span>
                    </div>
                )}
            </div>

            <div className="border-border border-t"></div>

            <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">{hasExistingCart ? "New Total" : "Total"}</span>
                <span className="text-foreground font-mono text-base font-bold">
                    {formatPrice(hasExistingCart ? newCartTotal : totalPrice, currencyCode)}
                </span>
            </div>
        </>
    );
};

const LoadingSkeleton = () => (
    <div className="bg-accent rounded-lg border p-4 shadow-sm">
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-start justify-between py-1">
                    <div className="flex items-center gap-1">
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>

            <div className="border-border border-t"></div>

            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-20" />
            </div>
        </div>
    </div>
);

export const ShoppingSummary = ({
    product,
    selectedVariant,
    quantity,
    isLoading = false,
    isVariantTransitioning = false
}: ShoppingSummaryProps) => {
    const rootData = useRouteLoaderData<RootLoader>("root");

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="group bg-card rounded-lg border p-4 shadow-sm max-lg:mb-0">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="text-muted-foreground h-4 w-4" />
                    <span className="text-foreground group-hover:text-primary text-lg font-bold transition-colors lg:text-base">
                        Shopping Summary
                    </span>
                </div>

                <Suspense
                    fallback={
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                            <Spinner />
                            <span className="text-muted-foreground text-sm">Loading cart...</span>
                        </div>
                    }
                >
                    <Await resolve={rootData?.cart}>
                        {cart => (
                            <SummaryContent
                                product={product}
                                selectedVariant={selectedVariant}
                                quantity={quantity}
                                isVariantTransitioning={isVariantTransitioning}
                                cart={cart}
                            />
                        )}
                    </Await>
                </Suspense>
            </div>
        </div>
    );
};
