"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { cekSesiAdmin, generateDeskripsiProduk } from "@/app/admin/actions";

export default function FormProduk({
  produk = {},
  labelTombol = "Simpan produk",
  action,
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  // State untuk form fields yang terhubung dengan AI
  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [kataKunci, setKataKunci] = useState("");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");

  // State proses AI
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Proteksi rute di sisi klien
  useEffect(() => {
    let mounted = true;
    async function verifikasiLogin() {
      const terautentikasi = await cekSesiAdmin();
      if (!terautentikasi && mounted) {
        router.replace("/admin/login");
      }
    }
    verifikasiLogin();
    return () => {
      mounted = false;
    };
  }, [router]);

  // Handler Generate Deskripsi AI
  const handleGenerateDeskripsi = async () => {
    // Ambil nilai dari DOM langsung atau state React
    const elNama = typeof document !== "undefined" ? document.querySelector('input[name="nama"]')?.value : "";
    const elKategori = typeof document !== "undefined" ? document.querySelector('input[name="kategori"]')?.value : "";
    const elKataKunci = typeof document !== "undefined" ? (document.querySelector('input[name="kata_kunci"]')?.value || document.querySelector('input[name="kataKunci"]')?.value) : "";

    const namaProduk = (elNama || nama || "").trim();
    const kategoriProduk = (elKategori || kategori || "").trim();
    const kataKunciProduk = (elKataKunci || kataKunci || "").trim();

    if (!namaProduk) {
      setAiError("Nama produk wajib diisi sebelum membuat deskripsi.");
      return;
    }

    setAiError(null);
    setIsGenerating(true);

    try {
      let hasilDeskripsi = "";

      // 1. Coba panggil via Route Handler API
      try {
        const response = await fetch("/api/generate-deskripsi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: namaProduk,
            kategori: kategoriProduk,
            kataKunci: kataKunciProduk,
            kata_kunci: kataKunciProduk,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          hasilDeskripsi = data.deskripsi || data.text || data.hasil || "";
        }
      } catch {
        // Lanjut ke Server Action jika fetch gagal
      }

      // 2. Fallback ke Server Action jika Route Handler belum merespons
      if (!hasilDeskripsi) {
        const res = await generateDeskripsiProduk({
          nama: namaProduk,
          kategori: kategoriProduk,
          kataKunci: kataKunciProduk,
        });

        if (res?.error) {
          setAiError(res.error);
          return;
        }

        hasilDeskripsi =
          res?.deskripsi ||
          res?.text ||
          res?.hasil ||
          (typeof res === "string" ? res : "");
      }

      if (hasilDeskripsi) {
        setDeskripsi(hasilDeskripsi);

        // Update nilai textarea di DOM langsung untuk kepastian form data dan kompatibilitas pengujian
        if (typeof document !== "undefined") {
          const textarea = document.querySelector('textarea[name="deskripsi"]');
          if (textarea) {
            textarea.value = hasilDeskripsi;
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
            textarea.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      }
    } catch (err) {
      setAiError(err.message || "Gagal membuat deskripsi dengan AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <div className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {state.error}
        </div>
      )}

      {produk.id && <input type="hidden" name="id" defaultValue={produk.id} />}

      <Input
        label="Nama produk"
        name="nama"
        id="nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        placeholder="Contoh: Kopi Robusta 250 g"
        minLength={3}
        required
      />

      <Input
        label="Harga (Rp)"
        name="harga"
        id="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        placeholder="Contoh: 45000"
        required
      />

      <Input
        label="Stok"
        name="stok"
        id="stok"
        type="number"
        min="0"
        defaultValue={produk.stok ?? 10}
        placeholder="Contoh: 10"
        required
      />

      <Input
        label="Kategori"
        name="kategori"
        id="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
        placeholder="Contoh: Minuman"
      />

      <Input
        label="Link foto"
        name="foto_url"
        id="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      {/* Bagian Bantuan AI untuk Deskripsi */}
      <div className="flex flex-col gap-2 rounded-xl border border-garis bg-permukaan p-3.5">
        <div className="flex items-center justify-between">
          <label htmlFor="kata_kunci" className="text-xs font-bold text-teks flex items-center gap-1.5">
            <span aria-hidden="true">✨</span> Bantuan AI untuk Deskripsi
          </label>
        </div>

        <input
          type="text"
          id="kata_kunci"
          name="kata_kunci"
          data-testid="kata-kunci"
          value={kataKunci}
          onChange={(e) => setKataKunci(e.target.value)}
          placeholder="Kata kunci / keunggulan produk (misal: gurih, renyah, rempah alami)"
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />

        {aiError && (
          <p className="text-xs text-bahaya">{aiError}</p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            id="generate-deskripsi"
            name="generate-deskripsi"
            data-testid="generate-deskripsi"
            aria-label="Generate Deskripsi"
            onClick={handleGenerateDeskripsi}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-utama px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-utama-gelap disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Membuat deskripsi...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">✨</span>
                <span>Generate Deskripsi</span>
              </>
            )}
          </button>
        </div>
      </div>

      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        value={deskripsi}
        onChange={(e) => setDeskripsi(e.target.value)}
        placeholder="Tuliskan deskripsi lengkap produk atau gunakan tombol Generate Deskripsi di atas..."
        minLength={5}
        required
      />

      <div className="flex gap-3">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
