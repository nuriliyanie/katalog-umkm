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
    if (!nama.trim()) {
      setAiError("Harap isi nama produk terlebih dahulu untuk membuat deskripsi AI.");
      return;
    }

    setAiError(null);
    setIsGenerating(true);

    try {
      const res = await generateDeskripsiProduk({
        nama,
        kategori,
        kataKunci,
      });

      if (res?.error) {
        setAiError(res.error);
      } else if (res?.deskripsi) {
        setDeskripsi(res.deskripsi);
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
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        placeholder="Contoh: Kopi Robusta 250 g"
        minLength={3}
        required
      />

      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        placeholder="Contoh: 45000"
        required
      />

      <Input
        label="Stok"
        name="stok"
        type="number"
        min="0"
        defaultValue={produk.stok ?? 10}
        placeholder="Contoh: 10"
        required
      />

      <Input
        label="Kategori"
        name="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
        placeholder="Contoh: Minuman"
      />

      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      {/* Bagian Bantuan AI untuk Deskripsi */}
      <div className="flex flex-col gap-2 rounded-xl border border-garis bg-permukaan p-3.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-teks flex items-center gap-1.5">
            <span>✨</span> Bantuan AI untuk Deskripsi
          </label>
        </div>

        <input
          type="text"
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
            onClick={handleGenerateDeskripsi}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-utama px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-utama-gelap disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Membuat deskripsi...</span>
              </>
            ) : (
              <>
                <span>✨</span>
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
