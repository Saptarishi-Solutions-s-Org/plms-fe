"use client";

import Image from "next/image";
import { UnderConstructionProps } from "@/types/dialog-types";

export default function UnderConstructionPage({
  title,
}: UnderConstructionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center text-center px-4">
        <Image
          src="/underconstruction.svg"
          alt="Under Construction"
          width={420}
          height={320}
          priority
        />

        <p className="mt-6 text-sm text-black-300">
          We'll let you know when things are good to go
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-blue-600">
          {title}
        </h1>
      </div>
    </div>
  );
}
