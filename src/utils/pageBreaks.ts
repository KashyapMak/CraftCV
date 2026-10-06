/**
 * Smart Page Break & Boundary Detection Utility
 * Prevents text, headings, and cards from being horizontally sliced across A4 page breaks.
 */

export interface SmartPageBreakResult {
  totalPages: number;
  // Content slice heights in mm for each page (e.g. [268.4, 257.0])
  sliceHeightsMm: number[];
  // Negative marginTop offset in mm for each page (e.g. [0, 268.4, 525.4])
  sliceOffsetsMm: number[];
  // Whether an element boundary was adjusted to avoid a horizontal slice
  hasSmartAdjustment: boolean;
  // Descriptive label of the element preserved across the break (if any)
  adjustedElementLabel?: string;
}

/**
 * Calculates content-aware page break boundaries on the canonical rendered CV document.
 * If any section, heading, card, or bullet item crosses the A4 page boundary,
 * the break is cleanly placed above that element so it renders fully intact on the next page.
 */
export const calculateSmartPageBreaks = (
  containerEl: HTMLElement | null,
  pageMarginMm: number,
  smartBreaksEnabled: boolean = true
): SmartPageBreakResult => {
  const maxP1Mm = 297 - pageMarginMm;
  const maxNextMm = 297 - 2 * pageMarginMm;

  // Fallback defaults when measurement element is not ready
  if (!containerEl) {
    return {
      totalPages: 1,
      sliceHeightsMm: [maxP1Mm, maxNextMm, maxNextMm],
      sliceOffsetsMm: [0, maxP1Mm, maxP1Mm + maxNextMm],
      hasSmartAdjustment: false
    };
  }

  // Measure physical dimensions
  const containerWidthPx = containerEl.clientWidth || 794;
  // A4 standard width is 210mm
  const mmToPx = containerWidthPx / 210;
  const totalContentHeightPx = containerEl.scrollHeight;
  const containerRect = containerEl.getBoundingClientRect();

  const maxP1Px = maxP1Mm * mmToPx;
  const maxNextPx = maxNextMm * mmToPx;

  // 1. Single Page: fits completely on Page 1 (within subpixel tolerance)
  if (totalContentHeightPx <= maxP1Px + 3) {
    return {
      totalPages: 1,
      sliceHeightsMm: [maxP1Mm],
      sliceOffsetsMm: [0],
      hasSmartAdjustment: false
    };
  }

  // If smart breaks is disabled, fallback to standard fixed mathematical slicing
  if (!smartBreaksEnabled) {
    const overflowPx = totalContentHeightPx - maxP1Px;
    const extraPages = Math.ceil(overflowPx / maxNextPx);
    const totalPages = Math.min(3, 1 + extraPages);
    return {
      totalPages,
      sliceHeightsMm: [maxP1Mm, maxNextMm, maxNextMm],
      sliceOffsetsMm: [0, maxP1Mm, maxP1Mm + maxNextMm],
      hasSmartAdjustment: false
    };
  }

  // 2. Multi-page: Find all candidate breakable elements
  // These are items that should never be sliced horizontally across page breaks:
  // sections, .break-inside-avoid cards, headings, list items, paragraphs, table rows
  const candidates = Array.from(
    containerEl.querySelectorAll<HTMLElement>(
      'section, article, .break-inside-avoid, [data-break-avoid], h1, h2, h3, h4, h5, li, p, tr, blockquote'
    )
  );

  /**
   * Helper to find the best cut point before a given target Y coordinate
   */
  const findCleanBreakPoint = (
    targetYPx: number,
    minAllowedYPx: number
  ): { cutPx: number; adjusted: boolean; elementLabel?: string } => {
    // Find all candidate elements that straddle the target boundary line
    // i.e., top is before the line (with 4px buffer), but bottom extends past it
    const straddling = candidates.filter((el) => {
      const r = el.getBoundingClientRect();
      const top = r.top - containerRect.top;
      const bottom = r.bottom - containerRect.top;
      // Skip invisible / zero-height elements
      if (r.height < 4 || r.width < 4) return false;
      return top < targetYPx - 4 && bottom > targetYPx + 4;
    });

    if (straddling.length === 0) {
      return { cutPx: targetYPx, adjusted: false };
    }

    // Among all straddling elements, we pick the innermost block (highest top position)
    // so we don't prematurely discard earlier items from the page.
    let bestTopPx = 0;
    let chosenElement: HTMLElement | null = null;

    for (const el of straddling) {
      const r = el.getBoundingClientRect();
      const top = r.top - containerRect.top;

      if (top > minAllowedYPx && top > bestTopPx) {
        bestTopPx = top;
        chosenElement = el;
      }
    }

    if (!chosenElement || bestTopPx <= minAllowedYPx) {
      return { cutPx: targetYPx, adjusted: false };
    }

    let finalCutPx = bestTopPx - 6; // 6px buffer above element
    let label = chosenElement.innerText?.slice(0, 35).replace(/\s+/g, ' ').trim() || chosenElement.tagName;

    // Check if the chosen element has an immediate heading directly preceding it.
    // If so, break before the heading to prevent leaving an orphaned heading alone at the bottom of the page.
    let prev = chosenElement.previousElementSibling as HTMLElement | null;
    while (prev) {
      const prevTag = prev.tagName.toUpperCase();
      const prevRect = prev.getBoundingClientRect();
      const prevTop = prevRect.top - containerRect.top;
      const prevBottom = prevRect.bottom - containerRect.top;

      if (
        ['H1', 'H2', 'H3', 'H4', 'H5', 'HEADER'].includes(prevTag) &&
        prevBottom >= bestTopPx - 65 &&
        prevTop > minAllowedYPx
      ) {
        finalCutPx = prevTop - 6;
        label = prev.innerText?.slice(0, 35).replace(/\s+/g, ' ').trim() || prevTag;
        break;
      }
      prev = prev.previousElementSibling as HTMLElement | null;
    }

    return {
      cutPx: Math.max(minAllowedYPx, finalCutPx),
      adjusted: true,
      elementLabel: label
    };
  };

  // --- Calculate Cut 1 (Page 1 -> Page 2) ---
  const minP1Px = maxP1Px * 0.55; // At least 55% of page 1 filled
  const break1 = findCleanBreakPoint(maxP1Px, minP1Px);
  const cut1Px = break1.cutPx;
  const cut1Mm = cut1Px / mmToPx;

  const remainingAfterP1Px = totalContentHeightPx - cut1Px;

  // If everything left fits on Page 2:
  if (remainingAfterP1Px <= maxNextPx + 3) {
    return {
      totalPages: 2,
      sliceHeightsMm: [cut1Mm, maxNextMm],
      sliceOffsetsMm: [0, cut1Mm],
      hasSmartAdjustment: break1.adjusted,
      adjustedElementLabel: break1.elementLabel
    };
  }

  // --- Calculate Cut 2 (Page 2 -> Page 3) ---
  const targetP2EndPx = cut1Px + maxNextPx;
  const minP2Px = cut1Px + maxNextPx * 0.5;
  const break2 = findCleanBreakPoint(targetP2EndPx, minP2Px);
  const cut2Px = break2.cutPx;
  const cut2Mm = cut2Px / mmToPx;

  const p2HeightMm = (cut2Px - cut1Px) / mmToPx;

  return {
    totalPages: 3,
    sliceHeightsMm: [cut1Mm, p2HeightMm, maxNextMm],
    sliceOffsetsMm: [0, cut1Mm, cut2Mm],
    hasSmartAdjustment: break1.adjusted || break2.adjusted,
    adjustedElementLabel: break1.elementLabel || break2.elementLabel
  };
};
