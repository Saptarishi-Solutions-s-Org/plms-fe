import LegalDocument from "@/components/public/LegalDocument";
import { legalSections } from "@/components/public/public-content";

export default function TermsAndConditionsPage() {
  return (
    <LegalDocument
      eyebrow="Terms And Conditions"
      title="Operating terms for PLMS users."
      intro="These terms define authorized use, account responsibilities, lead and offer data integrity, role boundaries, and system availability expectations for the Project Lead Management System."
      lastUpdated="May 11, 2026"
      sections={legalSections.terms}
      related={[
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "FAQs", href: "/faqs" },
        { label: "Contact", href: "/contact" },
      ]}
      variant="terms"
    />
  );
}
