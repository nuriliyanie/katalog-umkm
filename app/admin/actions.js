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

export async function ubahProduk(idOrPrevState, prevStateOrFormData, maybeFormData) {
  let id = null;
  let data = null;

  if (typeof idOrPrevState === "string" || typeof idOrPrevState === "number") {
    id = idOrPrevState;
    data =
      maybeFormData instanceof FormData
        ? maybeFormData
        : prevStateOrFormData instanceof FormData
        ? prevStateOrFormData
        : null;
  } else {
    data =
      prevStateOrFormData instanceof FormData
        ? prevStateOrFormData
        : idOrPrevState instanceof FormData
        ? idOrPrevState
        : null;
    id = data?.get("id");
  }

  if (!id) {
    return { error: "ID produk tidak ditemukan." };
  }

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

    let { error: updateError } = await supabase
      .from("produk")
      .update(payload)
      .eq("id", id);

    // Fallback jika tabel Supabase belum memiliki kolom stok
    if (
      updateError &&
      updateError.message &&
      updateError.message.includes("stok")
    ) {
      delete payload.stok;
      const retry = await supabase
        .from("produk")
        .update(payload)
        .eq("id", id);
      updateError = retry.error;
    }

    if (updateError) {
      return { error: `Gagal memperbarui produk: ${updateError.message}` };
    }

    shouldRedirect = true;
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan saat memperbarui produk.",
    };
  }

  if (shouldRedirect) {
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/produk/${id}`);
    redirect("/admin");
  }
}

export async function hapusProduk(idOrFormData) {
  let id = null;
  if (idOrFormData instanceof FormData) {
    id = idOrFormData.get("id");
  } else {
    id = idOrFormData;
  }

  if (!id) {
    return { error: "ID produk tidak ditemukan.", success: false };
  }

  try {
    const supabase = await createSessionClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        error: "Akses ditolak: Anda harus login terlebih dahulu.",
        success: false,
      };
    }

    const { error: deleteError } = await supabase
      .from("produk")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return {
        error: `Gagal menghapus produk: ${deleteError.message}`,
        success: false,
      };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan saat menghapus produk.",
      success: false,
    };
  }
}

export async function generateDeskripsiProduk(arg1, arg2, arg3) {
  let nama = "";
  let kategori = "";
  let kataKunci = "";

  if (typeof arg1 === "string") {
    nama = arg1;
    kategori = arg2 || "";
    kataKunci = arg3 || "";
  } else if (arg1 instanceof FormData) {
    nama = arg1.get("nama") || "";
    kategori = arg1.get("kategori") || "";
    kataKunci = arg1.get("kata_kunci") || arg1.get("kataKunci") || "";
  } else if (arg1 && typeof arg1 === "object") {
    nama = arg1.nama || "";
    kategori = arg1.kategori || "";
    kataKunci = arg1.kataKunci || arg1.kata_kunci || "";
  }

  nama = String(nama || "").trim();
  kategori = String(kategori || "").trim();
  kataKunci = String(kataKunci || "").trim();

  if (!nama) {
    return { error: "Nama produk wajib diisi sebelum membuat deskripsi." };
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (apiKey) {
    const models = [
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-pro",
    ];

    const prompt = `Buatkan deskripsi produk yang menarik, ramah, dan menjual untuk katalog UMKM di Indonesia.
Nama Produk: ${nama}
${kategori ? `Kategori: ${kategori}` : ""}
${kataKunci ? `Kata Kunci / Keunggulan: ${kataKunci}` : ""}

Instruksi:
- Tuliskan dalam 2-3 kalimat yang menarik dan menggugah minat pembeli.
- Langsung berikan teks deskripsi saja tanpa tanda kutip dan tanpa kata pembuka/penutup.`;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const hasilTeks =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (hasilTeks) {
            return {
              success: true,
              deskripsi: hasilTeks,
              text: hasilTeks,
              hasil: hasilTeks,
            };
          }
        }
      } catch (err) {
        console.error(`Gemini API error (${model}):`, err);
      }
    }
  }

  // Generator deskripsi cerdas kontekstual jika API key belum disetel atau kuota habis
  const katLower = kategori.toLowerCase();
  let deskripsiCerdas = "";

  if (
    katLower.includes("makan") ||
    katLower.includes("snack") ||
    katLower.includes("kue") ||
    katLower.includes("kuliner")
  ) {
    const detail = kataKunci ? ` dengan sentuhan rasa ${kataKunci}` : "";
    deskripsiCerdas = `Nikmati kelezatan ${nama} yang diolah secara higienis dari bahan-bahan pilihan berkualitas tinggi${detail}. Memiliki cita rasa lezat dan menggugah selera, produk ini sangat pas untuk teman bersantai maupun dinikmati bersama keluarga tercinta.`;
  } else if (
    katLower.includes("minum") ||
    katLower.includes("kopi") ||
    katLower.includes("teh") ||
    katLower.includes("jus")
  ) {
    const detail = kataKunci ? ` dengan keistimewaan aroma dan rasa ${kataKunci}` : "";
    deskripsiCerdas = `${nama} menghadirkan kesegaran alami yang menyegarkan hari-hari Anda${detail}. Diramu dari bahan alami bermutu terbaik, menyuguhkan kenikmatan autentik di setiap tegukan yang cocok dinikmati kapan saja.`;
  } else if (
    katLower.includes("pakaian") ||
    katLower.includes("fashion") ||
    katLower.includes("baju") ||
    katLower.includes("celana") ||
    katLower.includes("jaket")
  ) {
    const detail = kataKunci ? ` yang ${kataKunci}` : "";
    deskripsiCerdas = `Tampil percaya diri bersama ${nama} berdesain modern dan trendi${detail}. Terbuat dari bahan premium yang adem dan nyaman digunakan sepanjang hari, sangat cocok melengkapi gaya harian maupun acara spesial Anda.`;
  } else if (
    katLower.includes("kriya") ||
    katLower.includes("kerajinan") ||
    katLower.includes("dekor") ||
    katLower.includes("aksesoris")
  ) {
    const detail = kataKunci ? ` berkarakter ${kataKunci}` : "";
    deskripsiCerdas = `${nama} adalah karya istimewa bernilai seni tinggi yang dikerjakan dengan ketelitian tangan para perajin lokal${detail}. Desainnya yang unik dan elegan siap mempercantik ruangan Anda sekaligus memberikan sentuhan eksklusif.`;
  } else {
    const kText = kategori ? ` dalam kategori ${kategori}` : "";
    const detail = kataKunci ? ` dengan keunggulan ${kataKunci}` : "";
    deskripsiCerdas = `${nama} merupakan produk pilihan terbaik${kText}${detail}. Dibuat dengan standar mutu terjamin dan perhatian penuh pada kepuasan pelanggan, menjadikannya pilihan tepat dan andal untuk melengkapi kebutuhan Anda.`;
  }

  return {
    success: true,
    deskripsi: deskripsiCerdas,
    text: deskripsiCerdas,
    hasil: deskripsiCerdas,
  };
}
