import { useEffect, useState } from "react";

export function useInputMode() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return { isMobile };
}
