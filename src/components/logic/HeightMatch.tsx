import React, { useEffect, useRef } from "react";

function useHeightMatch(setHeight: (height: number) => void) {
  const heightReferenceDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heightReferenceDivRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const height = entries[0].borderBoxSize[0].blockSize;
        setHeight(height + 1);
      }
    });
    resizeObserver.observe(heightReferenceDivRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [heightReferenceDivRef, setHeight]);

  return heightReferenceDivRef;
}

export default function HeightMatch({
  children,
  setHeight,
}: {
  children: React.ReactNode;
  setHeight: (height: number) => void;
}) {
  const heightReferenceDivRef = useHeightMatch(setHeight);

  return <div ref={heightReferenceDivRef}>{children}</div>;
}
