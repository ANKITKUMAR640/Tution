export default function SectionHeading({ eyebrow, title, text, light = false, align = "center" }) {
  return <div className={`section-heading ${light ? "light" : ""} align-${align}`}>
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    {text && <p>{text}</p>}
  </div>;
}
