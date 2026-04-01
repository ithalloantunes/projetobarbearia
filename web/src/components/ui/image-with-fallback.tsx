"use client";

import { useEffect, useRef } from "react";

type ImageWithFallbackProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "onError"
> & {
  fallbackSrc: string;
};

export default function ImageWithFallback({
  src,
  fallbackSrc,
  ...props
}: ImageWithFallbackProps) {
  const didFallback = useRef(false);

  useEffect(() => {
    didFallback.current = false;
  }, [src, fallbackSrc]);

  return (
    <img
      {...props}
      src={src || fallbackSrc}
      onError={(event) => {
        if (didFallback.current) {
          return;
        }
        didFallback.current = true;
        event.currentTarget.src = fallbackSrc;
      }}
    />
  );
}
