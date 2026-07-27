import { useCallback, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import type { NavigateOptions, To } from "react-router-dom";

/**
 * Drop-in replacement for `useNavigate` that wraps every navigation inside
 * `startTransition`. This prevents the "A component suspended while responding
 * to synchronous input" error when navigating to lazy-loaded routes from click
 * or keyboard event handlers.
 *
 * React treats transitions as non-urgent: the current page stays visible and
 * interactive while the new chunk loads, then swaps in atomically.
 */
export function useTransitionNavigate() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      startTransition(() => {
        if (typeof to === "number") {
          navigate(to);
        } else {
          navigate(to, options);
        }
      });
    },
    [navigate, startTransition],
  );
}
