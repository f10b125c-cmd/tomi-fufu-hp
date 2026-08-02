"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

type MemoryCardProps = {
  src: string;
  alt: string;
  tag: string;
  caption: string;
  video?: string;
};

export default function MemoryCard({ src, alt, tag, caption, video }: MemoryCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="relative h-[440px] w-[78vw] flex-none snap-start overflow-hidden rounded-[28px] sm:w-[380px]">
      {video ? (
        <video
          ref={videoRef}
          src={video}
          poster={src}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Image src={src} alt={alt} fill className="object-cover" />
      )}
      <figcaption className="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-black/75 to-transparent px-6 py-8">
        <b className="text-xl tracking-[0.1em]">{tag}</b>
        <span className="mt-1 text-sm text-white/80">{caption}</span>
      </figcaption>
    </figure>
  );
}
