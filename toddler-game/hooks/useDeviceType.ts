"use client";

import { useEffect, useState } from "react";

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Mobi|Android|iPhone|iPad|iPod/i;
      setIsMobile(window.innerWidth < 768 || mobileRegex.test(userAgent));
    };

    check(); // run once
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return { isMobile, isDesktop: !isMobile };
}
