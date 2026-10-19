"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { cekSesiAdmin } from "@/app/admin/actions";

export default function FormProduk({
  produk = {},
  labelTombol = "Simpan produk",
  action,
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

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
        defaultValue={produk.nama}
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
        defaultValue={produk.kategori}
        placeholder="Contoh: Minuman"
      />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />
      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        defaultValue={produk.deskripsi}
        placeholder="Tuliskan deskripsi lengkap produk..."
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
