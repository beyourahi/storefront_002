import {STORE_FORMAT_LOCALE} from "~/lib/store-locale";

export const formatPriceWithLocale = (amount: number, currencyCode: string): string => {
    try {
        if (typeof amount !== "number" || isNaN(amount)) {
            return `${currencyCode} 0.00`;
        }

        if (!currencyCode || typeof currencyCode !== "string" || currencyCode.length !== 3) {
            return `${currencyCode || "USD"} ${amount.toFixed(2)}`;
        }

        return new Intl.NumberFormat(STORE_FORMAT_LOCALE, {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    } catch {
        const formattedAmount = amount.toFixed(2);

        const currencySymbols: Record<string, string> = {
            USD: "$",
            EUR: "€",
            GBP: "£",
            JPY: "¥",
            CAD: "C$",
            AUD: "A$",
            CHF: "CHF",
            CNY: "¥",
            INR: "₹",
            MXN: "$",
            BRL: "R$",
            ZAR: "R",
            KRW: "₩",
            SGD: "S$",
            HKD: "HK$",
            NOK: "kr",
            SEK: "kr",
            DKK: "kr",
            PLN: "zł",
            THB: "฿",
            IDR: "Rp",
            HUF: "Ft",
            CZK: "Kč",
            ILS: "₪",
            CLP: "$",
            PHP: "₱",
            AED: "د.إ",
            COP: "$",
            SAR: "﷼",
            MYR: "RM",
            RON: "lei"
        };

        const symbol = currencySymbols[currencyCode] || currencyCode;

        return `${symbol}${formattedAmount}`;
    }
};

export const formatShopifyMoney = (money: {amount: string; currencyCode: string}): string => {
    if (!money || typeof money !== "object") {
        return "USD 0.00";
    }

    if (!money.amount || typeof money.amount !== "string") {
        return `${money.currencyCode || "USD"} 0.00`;
    }

    const amount = parseFloat(money.amount);

    if (isNaN(amount)) {
        return `${money.currencyCode || "USD"} 0.00`;
    }

    return formatPriceWithLocale(amount, money.currencyCode || "USD");
};

export const getZeroFallbackWithCurrency = (currencyCode: string): string => {
    return formatPriceWithLocale(0, currencyCode || "USD");
};
