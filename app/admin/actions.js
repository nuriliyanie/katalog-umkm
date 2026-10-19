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

