export function MarqueeBanner() {
  const items = ["YOURS", "THINK CLEARLY", "EVERY DAY", "PRIVATE", "YOURS", "THINK CLEARLY", "EVERY DAY", "PRIVATE"];

  return (
    <div className="marquee">
      <div className="marquee__track">
        {[...items, ...items].map((t, i) => (
          <div className="marquee__item" key={i}>
            <span className="marquee__dash" />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
