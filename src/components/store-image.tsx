import Image from "next/image";
import { safeImage } from "@/lib/format";

export function StoreImage({
  src,
  alt,
  className,
  fill,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const url = safeImage(src) || src;
  if (url.startsWith("/api/uploads/")) {
    return (
      // Runtime uploads are streamed by the API, which next/image cannot read from public/.
      <img
        src={url}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={fill ? `absolute inset-0 h-full w-full ${className || ""}` : className}
      />
    );
  }
  return <Image src={url} alt={alt} fill={fill} sizes={sizes} priority={priority} className={className} />;
}
