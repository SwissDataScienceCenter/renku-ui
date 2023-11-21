interface AsyncImageProps {
  imageSrc: string;
  alt: string;
}
export default function AsyncImage({ imageSrc, alt }: AsyncImageProps) {
  return <img src={imageSrc} alt={alt} />;
}
