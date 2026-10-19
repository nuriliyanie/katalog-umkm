"use client";

import { useEffect, useState } from "react";

export default function TombolInstallPWA({ className = "" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [sudahTerpasang, setSudahTerpasang] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [petunjukIOS, setPetunjukIOS] = useState(false);
  const [petunjukLain, setPetunjukLain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Cek apakah sudah berjalan dalam mode standalone (sudah diinstall)
    const cekStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (cekStandalone) {
      setSudahTerpasang(true);
      return;
    }

    // Deteksi perangkat iOS
    const userAgent = window.navigator.userAgent || "";
    const isIosDevice =
      /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // Tangkap event beforeinstallprompt untuk Android / Chromium browser
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Tangkap event saat aplikasi berhasil diinstall
    const handleAppInstalled = () => {
      setSudahTerpasang(true);
      setDeferredPrompt(null);
      setPetunjukIOS(false);
      setPetunjukLain(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!mounted || sudahTerpasang) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult?.outcome === "accepted") {
        setSudahTerpasang(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setPetunjukIOS((prev) => !prev);
    } else {
      setPetunjukLain((prev) => !prev);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        id="tombol-install-pwa"
        data-testid="tombol-install-pwa"
        aria-label="Download aplikasi"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 rounded-lg border border-utama bg-utama px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-utama-gelap active:scale-95 cursor-pointer sm:text-sm sm:px-3.5 sm:py-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>Download aplikasi</span>
      </button>

      {/* Petunjuk khusus iOS / Safari */}
      {petunjukIOS && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-garis bg-latar p-3.5 text-xs shadow-lg text-teks">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-bold text-utama">Cara Pasang di iPhone/iPad:</span>
            <button
              type="button"
              onClick={() => setPetunjukIOS(false)}
              className="text-teks-lembut hover:text-teks text-sm leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-teks-lembut leading-relaxed">
            1. Tekan ikon <strong>Bagikan (Share)</strong> di bilah Safari.<br />
            2. Pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (Add to Home Screen).
          </p>
        </div>
      )}

      {/* Petunjuk browser desktop */}
      {petunjukLain && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-garis bg-latar p-3.5 text-xs shadow-lg text-teks">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-bold text-utama">Pasang Aplikasi:</span>
            <button
              type="button"
              onClick={() => setPetunjukLain(false)}
              className="text-teks-lembut hover:text-teks text-sm leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-teks-lembut leading-relaxed">
            Klik ikon <strong>Instal</strong> di bilah alamat (address bar) browser Anda atau pilih menu titik tiga browser lalu pilih <strong>&quot;Install Aplikasi&quot;</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

