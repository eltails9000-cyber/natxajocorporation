import { Link } from "@tanstack/react-router";

export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <Link to="/" aria-label="NATXAJO CORPORATION — Inicio" className="inline-flex shrink-0">
      <img
        src="/assets/brand/logo-horizontal.png"
        alt="NATXAJO CORPORATION"
        className={`${className} w-auto object-contain`}
        width={1095}
        height={338}
      />
    </Link>
  );
}
