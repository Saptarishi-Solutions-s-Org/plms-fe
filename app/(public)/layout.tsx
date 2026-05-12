import PublicFooter from "@/components/public/PublicFooter";
import PublicHeader from "@/components/public/PublicHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7fbf7] text-[#0b1713]">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
