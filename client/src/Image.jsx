export default function Image({ src, ...rest }) {
  const baseUrl = 'http://localhost:5002/uploads/';
  const resolvedSrc = src?.startsWith('http') ? src : baseUrl + src;
  return <img {...rest} src={resolvedSrc} alt="" />;
}
