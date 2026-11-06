export default function PageHero({ eyebrow = "BHARTI EXCELLENT COACHING CENTER", title, text, image }) {
  return <section className="page-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,24,57,.96), rgba(5,24,57,.65), rgba(5,24,57,.18)), url(${image || "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=90"})` }}>
    <div className="container page-hero-content"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>
  </section>;
}
