import { useRef, useEffect } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      preload="metadata"
      poster={poster}
      className={`rounded-lg ${className}`}
      data-testid="video-player"
    >
      <source src={src} />
      Your browser does not support the video tag.
    </video>
  );
}
