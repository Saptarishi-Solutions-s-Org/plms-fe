import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "PLMS",
  description: "Developed by Team SRS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script
          id="strip-extension-hydration-attrs"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const shouldRemove = (name) =>
                  name === "bis_skin_checked" ||
                  name === "bis_register" ||
                  name.startsWith("__processed_");

                const clean = (root) => {
                  if (!root || root.nodeType !== 1) return;
                  const nodes = [root, ...root.querySelectorAll("*")];
                  for (const node of nodes) {
                    for (const attr of [...node.attributes]) {
                      if (shouldRemove(attr.name)) node.removeAttribute(attr.name);
                    }
                  }
                };

                clean(document.documentElement);

                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === "attributes" && shouldRemove(mutation.attributeName || "")) {
                      mutation.target.removeAttribute(mutation.attributeName);
                    }
                    for (const node of mutation.addedNodes) clean(node);
                  }
                });

                observer.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true,
                });

                window.addEventListener("load", () => observer.disconnect(), { once: true });
              })();
            `,
          }}
        />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
