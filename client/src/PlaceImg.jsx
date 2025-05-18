import Image from "./Image.jsx";

export default function PlaceImg({ place, index = 0, className = null }) {
  if (!place.photos?.length) {
    return '';
  }

  const photoPath = `/uploads/${place.photos[index]}`;

  if (!className) {
    className = 'object-cover';
  }

  return (
    <Image className={className} src={photoPath} alt="" />
  );
}
