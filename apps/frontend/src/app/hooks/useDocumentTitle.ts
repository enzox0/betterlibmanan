import { useEffect, useRef } from "react";

interface UseDocumentTitleOptions {
  preserveTitleOnUnmount?: boolean;
  suffix?: string;
}

const DEFAULT_TITLE = "BetterLibmanan";
const DEFAULT_SUFFIX = " | BetterLibmanan";

/**
 * Custom hook to manage document title dynamically
 * @param title - The page title (without suffix)
 * @param options - Configuration options
 * @example
 * useDocumentTitle('Services'); // Results in "Services | BetterLibmanan"
 * useDocumentTitle('Home', { suffix: '' }); // Results in "Home"
 */
export function useDocumentTitle(
  title: string,
  options: UseDocumentTitleOptions = {},
): void {
  const { preserveTitleOnUnmount = false, suffix = DEFAULT_SUFFIX } = options;
  const previousTitleRef = useRef<string>(document.title);

  useEffect(() => {
    const previousTitle = previousTitleRef.current;

    // Update document title
    document.title = title ? `${title}${suffix}` : DEFAULT_TITLE;

    // Restore previous title on unmount if requested
    return () => {
      if (!preserveTitleOnUnmount) {
        document.title = previousTitle;
      }
    };
  }, [title, suffix, preserveTitleOnUnmount]);
}
