import { Reveal } from "@/components/public/Reveal";
import { legalSections } from "@/components/public/public-content";

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="px-5 pb-16 pt-36 md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs font-semibold uppercase text-emerald-700">
            Privacy Policy
          </p>
          <h1 className="text-[clamp(40px,6vw,70px)] font-bold leading-tight text-[#0b1713]">
            How PLMS handles portal data.
          </h1>
          <p className="mt-6 text-sm leading-8 text-slate-600">
            This policy explains how Project Lead Management System information
            is used for authentication, lead workflows, offer operations,
            dashboards, and organization-level access control.
          </p>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white px-5 py-16 md:px-8">
        <div className="mx-auto max-w-4xl space-y-5">
          {legalSections.privacy.map((section, index) => (
            <Reveal key={section.title} delay={index * 0.04}>
              <article className="rounded-2xl border border-emerald-950/10 bg-[#fbfefb] p-6">
                <h2 className="text-xl font-bold text-[#0b1713]">{section.title}</h2>
                <p className="mt-3 text-sm leading-8 text-slate-600">{section.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
