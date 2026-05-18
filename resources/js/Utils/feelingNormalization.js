/**
 * Normalize a feeling value to 0-100 scale.
 *
 * Converts values from any scale (3-5) to a consistent 0-100(%) range.
 * - 3-point scale: 1=0, 2=50, 3=100
 * - 5-point scale: 1=0, 2=25, 3=50, 4=75, 5=100
 */
export function normalizeFeeling(feelingValue, maxScale = 5) {
    if (feelingValue == null || maxScale <= 1) return null;
    return Math.round((feelingValue - 1) / (maxScale - 1) * 100);
}

/**
 * Calculate the difference between two feeling values (normalized).
 *
 * Returns the change as a percentage on the normalized scale.
 * Positive = good, negative = bad
 */
export function calculateDifference(feelingBefore, feelingAfter, scaleValue = 5) {
    const before = normalizeFeeling(feelingBefore, scaleValue);
    const after  = normalizeFeeling(feelingAfter, scaleValue);
    if (before === null || after === null) return null;
    return after - before;
}
