"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;

  const email = data?.get("email");
  const password = data?.get("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let shouldRedirect = false;

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password),
    });

    if (error) {
      let pesan = error.message;
      if (
        error.message.toLowerCase().includes("invalid login credentials") ||
        error.message.toLowerCase().includes("invalid_grant")
      ) {
        pesan = "Email atau password salah. Silakan periksa kembali.";
      }
      return { error: pesan };
    }

    shouldRedirect = true;
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat masuk." };
  }

  if (shouldRedirect) {
    revalidatePath("/", "layout");
    redirect("/admin");
  }
}

export async function logout() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch (err) {
    // Abaikan jika sudah tidak ada sesi aktif
  }

  revalidatePath("/", "layout");
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;

  const passwordBaru = data?.get("password_baru");
  const konfirmasiPassword = data?.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (String(passwordBaru).length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  try {
    const supabase = await createSessionClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        error: "Sesi telah berakhir atau Anda belum login. Silakan login kembali.",
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: String(passwordBaru),
    });

    if (error) {
      return { error: error.message };
    }

    return { pesan: "Password berhasil diperbarui." };
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan saat mengganti password.",
    };
  }
}

export async function cekSesiAdmin() {
  try {
    const supabase = await createSessionClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return !error && !!user;
  } catch {
    return false;
  }
}

export async function tambahProduk(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;

  const nama = String(data?.get("nama") || "").trim();
  const hargaRaw = data?.get("harga");
  const stokRaw = data?.get("stok");
  const deskripsi = String(data?.get("deskripsi") || "").trim();
  const kategori = String(data?.get("kategori") || "").trim();
  const fotoUrl = String(data?.get("foto_url") || "").trim();

  // Validasi input di sisi server
  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }
  if (nama.length < 3) {
    return { error: "Nama produk minimal 3 karakter." };
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka valid dan minimal 0." };
  }

  const stok = parseInt(stokRaw, 10);
  if (
    stokRaw === null ||
    stokRaw === undefined ||
    stokRaw === "" ||
    isNaN(stok) ||
    stok < 0
  ) {
    return { error: "Stok produk harus berupa angka valid dan minimal 0." };
  }

  if (!deskripsi) {
    return { error: "Deskripsi produk wajib diisi." };
  }

  let shouldRedirect = false;

  try {
    const supabase = await createSessionClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Akses ditolak: Anda harus login terlebih dahulu." };
    }

    const payload = {
      nama,
      harga,
      deskripsi,
      kategori: kategori || null,
      foto_url: fotoUrl || null,
      stok,
    };

    let { error: insertError } = await supabase.from("produk").insert(payload);

    // Fallback jika tabel Supabase belum memiliki kolom stok
    if (
      insertError &&
      insertError.message &&
      insertError.message.includes("stok")
    ) {
      delete payload.stok;
      const retry = await supabase.from("produk").insert(payload);
      insertError = retry.error;
    }

    if (insertError) {
      return { error: `Gagal menyimpan produk: ${insertError.message}` };
    }

    shouldRedirect = true;
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menyimpan produk." };
  }

  if (shouldRedirect) {
    revalidatePath("/admin");
    revalidatePath("/");
    redirect("/admin");
  }
}
