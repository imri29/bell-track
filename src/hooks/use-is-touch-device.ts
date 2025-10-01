"use client";

import { useEffect, useState } from "react";

export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const getIsTouch = () => {
      if (window.matchMedia) {
        return window.matchMedia("(pointer: coarse)").matches;
      }

      return (
        "ontouchstart" in window ||
        (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0)
      );
    };

    setIsTouchDevice(getIsTouch());

    if (!window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: coarse)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsTouchDevice(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isTouchDevice;
}
