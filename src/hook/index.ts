import { useEffect, useRef } from "react";

export const useFirstRender = (handler: () => void) => {
  const ifFirstRender = useRef(true);
  useEffect(() => {
    if (!ifFirstRender.current) return;
    ifFirstRender.current = false;
    handler();
  }, []);
};
