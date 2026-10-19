"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker PWA aktif:", reg.scope);
          })
          .catch((err) => {
            console.error("Gagal mendaftarkan Service Worker:", err);
          });
      });
    }
  }, []);

  return null;
}

