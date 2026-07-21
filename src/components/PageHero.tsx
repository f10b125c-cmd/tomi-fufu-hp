const gradients = {
  warm: "from-[#fff2cf] to-[#ffd889]",
  sea: "from-[#d9f4ff] to-[#73c9ed]",
  sun: "from-[#fff0d6] to-[#ffb55e]",
  yellow: "from-[#fffbd3] to-[#ffdb62]",
} as const;

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  variant = "warm",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  variant?: keyof typeof gradients;
}) {
  return (
    <section
      className={`bg-gradient-to-br ${gradients[variant]} px-6 py-24 text-center md:px-12`}
    >
      <p className="text-sm font-bold tracking-[0.2em] text-brand-orange">{eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-brand-navy md:text-6xl">
        {title}
      </h1>
      {subtitle && <p className="mt-6 text-base text-brand-navy/70">{subtitle}</p>}
    </section>
  );
}
