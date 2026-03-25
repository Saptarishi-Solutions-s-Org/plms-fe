"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MaintenancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7fb] px-6 text-center">
      <div className="mb-5">
        <Image
          src="/saptarishi.png"
          alt="Saptarishi Solutions"
          width={100}
          height={90}
          priority
        />
      </div>

      <h1 className="text-xl md:text-2xl font-semibold text-[#5a6fd1] mb-4">
        We Are Under Maintenance
      </h1>

      <p className="text-gray-600 max-w-full mb-10">
        We are enhancing the PLMS system with new features just for you. We will
        be back soon!
      </p>

      <div className="bg-gradient-to-r from-indigo-200 to-indigo-100 rounded-2xl shadow-md p-8 max-w-xl">
        <p className="text-gray-700 italic mb-4">
          “Growth happens when we pause, reflect, and return stronger.”
        </p>

        <p className="text-[#5a6fd1] font-medium">
          Saptarishi Solutions PVT LTD
        </p>
      </div>

      <p className="text-gray-400 text-sm mt-12">
        © {new Date().getFullYear()}{" "}
        <a
          href="https://saptarishi.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-medium"
        >
          Saptarishi Solutions
        </a>
        . All Rights Reserved.
      </p>
    </div>
  );
}
