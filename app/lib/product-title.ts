/**
 * Shared utility for parsing product titles that use " + " as a delimiter.
 *
 * Example: "Rose + Oud" → primary: "Rose", secondary: "Oud"
 * Example: "Simple Title" → primary: "Simple Title", secondary: null
 *
 * Splits on the FIRST " + " only so "A + B + C" → primary: "A", secondary: "B + C".
 * A literal "+" without surrounding spaces (e.g. "C++ Guide") is NOT split.
 */
export function parseProductTitle(title: string): {
    primary: string;
    secondary: string | null;
    full: string;
} {
    const trimmed = title.trim();
    const delimiterIndex = trimmed.indexOf(" + ");

    if (delimiterIndex === -1) {
        return {primary: trimmed, secondary: null, full: trimmed};
    }

    const primary = trimmed.slice(0, delimiterIndex).trim();
    const secondary = trimmed.slice(delimiterIndex + 3).trim();

    return {
        primary,
        secondary: secondary || null,
        full: trimmed
    };
}
