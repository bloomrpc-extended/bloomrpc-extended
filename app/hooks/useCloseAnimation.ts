import { useState, useEffect, useRef } from 'react';

/**
 * Delays unmounting a modal/drawer so a CSS exit animation can play.
 * Returns `shouldRender` (keep in DOM) and `closing` (exit animation active).
 */
export function useCloseAnimation(visible: boolean, duration = 200) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (visible) {
      setShouldRender(true);
      setClosing(false);
    } else if (shouldRender) {
      setClosing(true);
      timerRef.current = setTimeout(() => {
        setShouldRender(false);
        setClosing(false);
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  return { shouldRender, closing };
}
