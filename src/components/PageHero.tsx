export default function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="bg-gradient-to-br from-[#fdeecb] via-[#fbdfa8] to-[#f8c97c] px-6 py-24 text-center md:px-12">
      <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">{eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-brand-navy md:text-6xl">
        {title}
      </h1>
      <p className="mt-6 text-base text-brand-navy/70">{subtitle}</p>
    </section>
  );
}
