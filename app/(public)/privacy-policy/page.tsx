import LegalDocument from "@/components/public/LegalDocument";
import { legalSections } from "@/components/public/public-content";

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      eyebrow="Privacy Policy"
      title="How PLMS protects workflow data."
      intro="This policy explains how Project Lead Management System data is collected, used, protected, and reviewed across public access, authentication, lead operations, offer workflows, and organization-level administration."
      lastUpdated="May 11, 2026"
      sections={legalSections.privacy}
      related={[
        { label: "Terms & Conditions", href: "/terms-and-conditions" },
        { label: "FAQs", href: "/faqs" },
        { label: "Contact", href: "/contact" },
      ]}
      variant="privacy"
    />
  );
}
