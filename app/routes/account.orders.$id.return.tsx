/**
 * @fileoverview Return Request Route
 *
 * @description
 * Allows customers to initiate return requests for eligible order items.
 * Displays returnable items with quantity and reason selection,
 * return policy information, and handles return submission.
 *
 * @route GET/POST /account/orders/:id/return
 *
 * @authentication
 * Requires customer authentication (enforced by parent account layout).
 * Validates customer owns the order and returns are enabled.
 *
 * @data-loading
 * - Returns eligibility check (redirects if disabled)
 * - Order details with returnable items
 * - Redirects to order page if no returnable items
 * - Order ID is base64-encoded in URL (atob to decode)
 *
 * @related
 * - account.orders._index.tsx - Order list with expandable cards
 * - account.returns._index.tsx - Returns history list
 * - ReturnsAvailabilityQuery.ts - Eligibility validation
 * - ReturnMutations.ts - Return request mutation
 */

import {data as remixData, redirect, Form, useLoaderData, useNavigation, useActionData, Link} from "react-router";
import type {Route} from "./+types/account.orders.$id.return";
import {Image} from "@shopify/hydrogen";
import type {OrderQuery} from "customer-accountapi.generated";
import {CUSTOMER_ORDER_QUERY} from "~/graphql/customer-account/CustomerOrderQuery";
import {RETURNS_AVAILABILITY_QUERY, checkReturnsEnabled} from "~/graphql/customer-account/ReturnsAvailabilityQuery";
import {
    ORDER_REQUEST_RETURN_MUTATION,
    RETURN_REASONS,
    type ReturnReasonValue
} from "~/graphql/customer-account/ReturnMutations";

// shadcn components
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/components/ui/card";
import {Button} from "~/components/ui/button";
import {Label} from "~/components/ui/label";
import {Input} from "~/components/ui/input";
import {Textarea} from "~/components/ui/textarea";
import {Alert, AlertDescription, AlertTitle} from "~/components/ui/alert";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";
import {Checkbox} from "~/components/ui/checkbox";
import {Separator} from "~/components/ui/separator";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "~/components/ui/accordion";
import {Clock, CheckCircle, XCircle, Info} from "lucide-react";

export const meta: Route.MetaFunction = ({data}) => {
    return [{title: `Return Request - Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
    const {customerAccount} = context;

    if (!params.id) {
        return redirect("/account/orders");
    }

    // Check if returns are enabled first
    const returnsAvailabilityResponse = await customerAccount.query(RETURNS_AVAILABILITY_QUERY, {
        variables: {
            first: 10,
            language: customerAccount.i18n.language
        }
    });

    const availabilityOrders = returnsAvailabilityResponse?.data?.customer?.orders?.nodes ?? [];
    const returnsEnabled = checkReturnsEnabled(availabilityOrders);

    // Redirect to orders list if returns are disabled
    if (!returnsEnabled) {
        throw redirect("/account/orders");
    }

    const orderId = atob(params.id);
    const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} = await customerAccount.query(
        CUSTOMER_ORDER_QUERY,
        {
            variables: {
                orderId,
                language: customerAccount.i18n.language
            }
        }
    );

    if (errors?.length || !data?.order) {
        throw new Error("Order not found");
    }

    const {order} = data;

    // Get returnable line items
    const returnableItems = order.returnInformation?.returnableLineItems?.nodes ?? [];

    // If no returnable items, redirect back to orders list
    if (returnableItems.length === 0) {
        return redirect("/account/orders");
    }

    return remixData(
        {order, returnableItems},
        {
            headers: {
                "Set-Cookie": await context.session.commit(),
                "Cache-Control": "no-cache, no-store, must-revalidate"
            }
        }
    );
}

export async function action({request, params, context}: Route.ActionArgs) {
    const {customerAccount} = context;

    if (!params.id) {
        return redirect("/account/orders");
    }

    const orderId = atob(params.id);
    const form = await request.formData();

    try {
        // Parse selected items from form data
        const requestedLineItems: Array<{
            lineItemId: string;
            quantity: number;
            returnReason: ReturnReasonValue;
            customerNote?: string;
        }> = [];

        // Get all line item IDs that were checked
        const formEntries = Array.from(form.entries());
        const selectedItems = formEntries
            .filter(([key]) => key.startsWith("selected_"))
            .map(([key]) => key.replace("selected_", ""));

        for (const lineItemId of selectedItems) {
            const quantity = parseInt(form.get(`quantity_${lineItemId}`)?.toString() || "0", 10);
            const returnReason = form.get(`reason_${lineItemId}`)?.toString() as ReturnReasonValue | undefined;
            const customerNote = form.get(`note_${lineItemId}`)?.toString();

            if (quantity > 0 && returnReason) {
                requestedLineItems.push({
                    lineItemId,
                    quantity,
                    returnReason,
                    ...(customerNote && {customerNote})
                });
            }
        }

        if (requestedLineItems.length === 0) {
            return remixData(
                {error: "Please select at least one item to return", success: false},
                {
                    status: 400,
                    headers: {"Set-Cookie": await context.session.commit()}
                }
            );
        }

        const {data: mutationData, errors} = await customerAccount.mutate(ORDER_REQUEST_RETURN_MUTATION, {
            variables: {
                orderId: `gid://shopify/Order/${orderId.split("/").pop()}`,
                requestedLineItems,
                language: customerAccount.i18n.language
            }
        });

        if (errors?.length) {
            throw new Error(errors[0].message);
        }

        if (mutationData?.orderRequestReturn?.userErrors?.length) {
            throw new Error(mutationData.orderRequestReturn.userErrors[0].message);
        }

        if (!mutationData?.orderRequestReturn?.return) {
            throw new Error("Failed to create return request");
        }

        // Return success
        return remixData(
            {
                success: true,
                returnId: mutationData.orderRequestReturn.return.id,
                returnName: mutationData.orderRequestReturn.return.name,
                error: null
            },
            {
                headers: {
                    "Set-Cookie": await context.session.commit(),
                    "Cache-Control": "no-cache, no-store, must-revalidate"
                }
            }
        );
    } catch (error: any) {
        return remixData(
            {error: error.message, success: false},
            {
                status: 400,
                headers: {"Set-Cookie": await context.session.commit()}
            }
        );
    }
}

type ActionData = {
    error?: string;
    success?: boolean;
    returnId?: string;
    returnName?: string;
};

export default function OrderReturnRoute() {
    const {order, returnableItems} = useLoaderData<typeof loader>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    // Success state
    if (actionData?.success) {
        return (
            <div className="space-y-6">
                <Alert>
                    <AlertTitle>Return Request Submitted</AlertTitle>
                    <AlertDescription>
                        Your return request {actionData.returnName} has been submitted successfully. We will review your
                        request and get back to you shortly.
                    </AlertDescription>
                </Alert>
                <Button asChild>
                    <Link to="/account/orders">Back to Orders</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <header className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Request Return</h2>
                <p className="text-sm text-muted-foreground">
                    Order {order.name} - Select items you would like to return
                </p>
            </header>

            <Separator />

            {/* Return Policy Section */}
            <ReturnPolicySection />

            {actionData?.error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{actionData.error}</AlertDescription>
                </Alert>
            )}

            <Form method="POST">
                <div className="space-y-4">
                    {returnableItems.map(item => (
                        <ReturnableItemCard key={item.lineItem.id} item={item} />
                    ))}
                </div>

                <div className="mt-6 flex gap-3">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Return Request"}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/account/orders">Cancel</Link>
                    </Button>
                </div>
            </Form>
        </div>
    );
}

type ReturnableItem = {
    quantity: number;
    lineItem: {
        id: string;
        title: string;
        variantTitle?: string | null;
        image?: {
            altText?: string | null;
            url: string;
            width?: number | null;
            height?: number | null;
        } | null;
    };
};

function ReturnableItemCard({item}: {item: ReturnableItem}) {
    const {lineItem, quantity: maxQuantity} = item;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                        <Checkbox id={`selected_${lineItem.id}`} name={`selected_${lineItem.id}`} value="true" />
                    </div>
                    {lineItem.image && (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                            <Image
                                data={lineItem.image}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <CardTitle className="text-base">
                            <label htmlFor={`selected_${lineItem.id}`} className="cursor-pointer">
                                {lineItem.title}
                            </label>
                        </CardTitle>
                        {lineItem.variantTitle && <CardDescription>{lineItem.variantTitle}</CardDescription>}
                        <p className="text-sm text-muted-foreground mt-1">Up to {maxQuantity} available to return</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor={`quantity_${lineItem.id}`}>Quantity to return</Label>
                        <Input
                            id={`quantity_${lineItem.id}`}
                            name={`quantity_${lineItem.id}`}
                            type="number"
                            min={1}
                            max={maxQuantity}
                            defaultValue={maxQuantity}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`reason_${lineItem.id}`}>Reason for return</Label>
                        <Select name={`reason_${lineItem.id}`} defaultValue="UNWANTED">
                            <SelectTrigger id={`reason_${lineItem.id}`}>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {RETURN_REASONS.map(reason => (
                                    <SelectItem key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`note_${lineItem.id}`}>Additional notes (optional)</Label>
                    <Textarea
                        id={`note_${lineItem.id}`}
                        name={`note_${lineItem.id}`}
                        placeholder="Please provide any additional details about your return..."
                        maxLength={300}
                        rows={2}
                    />
                    <p className="text-sm text-muted-foreground">Maximum 300 characters</p>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Return Policy Section - displays return eligibility, window, and guidelines
 */
function ReturnPolicySection() {
    return (
        <Card className="border-muted bg-muted/30">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Info className="size-5 text-primary" />
                    <CardTitle className="text-base">Return Policy</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Info */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-start gap-3">
                        <Clock className="size-5 shrink-0 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-sm">Return Window</p>
                            <p className="text-sm text-muted-foreground">30 days from delivery</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="size-5 shrink-0 text-success" />
                        <div>
                            <p className="font-medium text-sm">Free Returns</p>
                            <p className="text-sm text-muted-foreground">Prepaid shipping label</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <XCircle className="size-5 shrink-0 text-warning" />
                        <div>
                            <p className="font-medium text-sm">Refund Method</p>
                            <p className="text-sm text-muted-foreground">Original payment or store credit</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Policy Accordion */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="eligibility" className="border-muted">
                        <AccordionTrigger className="text-sm hover:no-underline">
                            Eligibility Requirements
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-2">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Items must be unworn, unwashed, and in original condition</li>
                                <li>All original tags and packaging must be attached</li>
                                <li>Items must be returned within 30 days of delivery</li>
                                <li>Proof of purchase is required (order confirmation email)</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="non-returnable" className="border-muted">
                        <AccordionTrigger className="text-sm hover:no-underline">Non-Returnable Items</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-2">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Final sale items marked as non-returnable</li>
                                <li>Intimates and swimwear (for hygiene reasons)</li>
                                <li>Personalized or custom-made items</li>
                                <li>Items damaged due to misuse</li>
                                <li>Gift cards and store credit</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="process" className="border-muted border-b-0">
                        <AccordionTrigger className="text-sm hover:no-underline">Return Process</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-2">
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Select items and submit your return request below</li>
                                <li>Receive a confirmation email with a prepaid shipping label</li>
                                <li>Pack items securely in original or similar packaging</li>
                                <li>Drop off at any authorized shipping location</li>
                                <li>Refund processed within 5-7 business days of receipt</li>
                            </ol>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}

export {RouteErrorBoundary as ErrorBoundary} from "~/components/RouteErrorBoundary";
