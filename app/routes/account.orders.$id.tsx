import {Link, useLoaderData} from "react-router";
import type {Route} from "./+types/account.orders.$id";
import {CUSTOMER_ORDER_QUERY} from "~/graphql/customer-account/CustomerOrderQuery";
import {Badge} from "~/components/ui/badge";
import {Button} from "~/components/ui/button";
import {Card} from "~/components/ui/card";
import {Separator} from "~/components/ui/separator";
import {formatShopifyMoney} from "~/lib/currency-formatter";
import {getOrderStatusVariant, formatOrderStatus} from "~/lib/order-status";
import {STORE_FORMAT_LOCALE} from "~/lib/store-locale";
import {ArrowLeftIcon} from "lucide-react";
import {parseProductTitle} from "~/lib/product";

export const meta: Route.MetaFunction = ({data}) => {
    const orderName = data?.order?.name ?? "Order";
    return [{title: `Order ${orderName}`}];
};

export const loader = async ({params, context}: Route.LoaderArgs) => {
    if (!params.id) {
        throw new Response("Order ID is required", {status: 400});
    }

    await context.customerAccount.handleAuthStatus();

    const orderId = params.id.startsWith("gid://") ? params.id : `gid://shopify/Order/${params.id}?key=${params.id}`;

    const {data, errors} = await context.customerAccount.query(CUSTOMER_ORDER_QUERY, {
        variables: {orderId}
    });

    if (errors?.length || !data?.order) {
        throw new Response("Order not found", {status: 404});
    }

    return {order: data.order};
};

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(STORE_FORMAT_LOCALE, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });

const OrderDetailPage = () => {
    const {order} = useLoaderData<typeof loader>();

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div>
                <Button variant="ghost" size="sm" asChild className="mb-4 gap-2">
                    <Link to="/account/orders">
                        <ArrowLeftIcon className="size-4" />
                        Back to Orders
                    </Link>
                </Button>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold sm:text-3xl">Order {order.name}</h1>
                        <p className="text-muted-foreground text-sm mt-1">{formatDate(order.processedAt)}</p>
                    </div>
                    <Badge variant={getOrderStatusVariant(order.fulfillmentStatus)} className="w-fit">
                        {formatOrderStatus(order.fulfillmentStatus)}
                    </Badge>
                </div>
            </div>

            <Card className="divide-y">
                {order.lineItems?.nodes?.map(item => (
                    <div key={item.id} className="flex gap-4 p-4">
                        {item.image && (
                            <img
                                src={item.image.url}
                                alt={item.image.altText ?? item.title}
                                className="size-16 rounded-md object-cover sm:size-20"
                                width={item.image.width ?? 80}
                                height={item.image.height ?? 80}
                            />
                        )}
                        <div className="flex flex-1 flex-col justify-center gap-1">
                            {(() => {
                                const {primary, secondary} = parseProductTitle(item.title);
                                return (
                                    <>
                                        <p className="font-medium">{primary}</p>
                                        {secondary && (
                                            <p className="opacity-50 text-sm font-normal">{secondary}</p>
                                        )}
                                    </>
                                );
                            })()}
                            {item.variantTitle && <p className="text-muted-foreground text-sm">{item.variantTitle}</p>}
                            <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                        </div>
                        {item.price && (
                            <div className="flex items-center">
                                <span className="font-medium">{formatShopifyMoney(item.price)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
                {order.shippingAddress && (
                    <Card className="p-4 space-y-2">
                        <h3 className="font-semibold">Shipping Address</h3>
                        <div className="text-sm space-y-1">
                            {order.shippingAddress.formatted?.map(line => (
                                <p key={line}>{line}</p>
                            ))}
                        </div>
                    </Card>
                )}

                <Card className="p-4 space-y-3">
                    <h3 className="font-semibold">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                        {order.subtotal && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatShopifyMoney(order.subtotal)}</span>
                            </div>
                        )}
                        {order.totalTax && parseFloat(order.totalTax.amount) > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>{formatShopifyMoney(order.totalTax)}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>{formatShopifyMoney(order.totalPrice)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {order.confirmationNumber && (
                <p className="text-muted-foreground text-center text-sm">Confirmation #{order.confirmationNumber}</p>
            )}
        </div>
    );
};

export default OrderDetailPage;

export {RouteErrorBoundary as ErrorBoundary} from "~/components/RouteErrorBoundary";
