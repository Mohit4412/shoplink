import Link from 'next/link';
import { AppLogo } from '@/src/components/ui/AppLogo';

type LegalSection = {
  title: string;
  body: string[];
};

export function LegalPageShell({
  eyebrow,
  title,
  intro,
  updatedAt,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] px-4 py-8 sm:px-5 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <AppLogo size="md" />
          <Link
            href="/"
            className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900"
          >
            Back to home
          </Link>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-gray-400">{eyebrow}</div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
          <p className="mt-4 text-base leading-8 text-gray-600">{intro}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
            Last updated {updatedAt}
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                <div className="mt-3 space-y-4 text-sm leading-7 text-gray-600 sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
