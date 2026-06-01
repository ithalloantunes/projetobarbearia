"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export default function LogoutButton({ className, label = "Sair" }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      try {
        localStorage.removeItem("barbersaas_user");
      } catch {
        // Ignora erro de storage para nao travar logout.
      }
      router.replace("/entrar");
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleLogout} disabled={loading} className={className}>
      {loading ? "Saindo..." : label}
    </button>
  );
}
