import { sb } from "./supabaseClient.js";

const el = (id) => document.getElementById(id);

export const BRL = (v) =>
  (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function toast(msg) {
  const t = el("toast");
  if (!t) {
    alert(msg);
    return;
  }
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(window.__t);
  window.__t = setTimeout(() => (t.style.display = "none"), 2600);
}

export async function requireAuth() {
  const { data } = await sb.auth.getSession();
  if (!data.session) {
    location.href = "index.html";
    return null;
  }
  return data.session.user;
}

/**
 * Garante que existe um perfil do usuário em profiles2.
 * - Se já existe: retorna.
 * - Se não existe: cria automaticamente (role padrão = vendedor) e retorna.
 */
export async function ensureProfile() {
  const user = await requireAuth();
  if (!user) return null;

  // 1) tenta carregar
  const { data: prof, error } = await sb
    .from("profiles2")
    .select("id,nome,role")
    .eq("id", user.id)
    .maybeSingle();

  // Se achou, beleza
  if (!error && prof) return { user, prof };

  // 2) se não achou, cria perfil automaticamente
  // (RLS permite inserir o próprio id)
  const nomeAuto =
    user.user_metadata?.nome ||
    user.user_metadata?.name ||
    user.email ||
    "Usuário";

  const roleAuto = (user.user_metadata?.role || "vendedor").toLowerCase();
  const roleFinal = ["vendedor", "gestor", "adm"].includes(roleAuto)
    ? roleAuto
    : "vendedor";

  const { error: insErr } = await sb.from("profiles2").insert({
    id: user.id,
    nome: nomeAuto,
    role: roleFinal,
  });

  // Se falhar aqui, normalmente é policy/RLS ou tabela divergente
  if (insErr) {
    toast(
      "Perfil não encontrado e não consegui criar automaticamente. Verifique RLS/policies da profiles2."
    );
    throw insErr;
  }

  // 3) busca de novo
  const { data: prof2, error: selErr2 } = await sb
    .from("profiles2")
    .select("id,nome,role")
    .eq("id", user.id)
    .single();

  if (selErr2 || !prof2) {
    toast("Criei o perfil, mas não consegui ler de volta. Verifique RLS.");
    throw selErr2 || new Error("profile_readback_failed");
  }

  return { user, prof: prof2 };
}

export async function logout() {
  await sb.auth.signOut();
  location.href = "index.html";
}

export function periodStart(kind) {
  const d = new Date();
  if (kind === "all") return new Date("2000-01-01T00:00:00");
  if (kind === "mtd") return new Date(d.getFullYear(), d.getMonth(), 1);
  const days = Number(kind);
  const s = new Date();
  s.setDate(s.getDate() - days);
  return s;
}

export function bindChipGroup(groupId, onChange) {
  const root = el(groupId);
  if (!root) return;

  root.querySelectorAll(".chip").forEach((btn) =>
    btn.addEventListener("click", () => {
      root.querySelectorAll(".chip").forEach((b) =>
        b.setAttribute("aria-pressed", "false")
      );
      btn.setAttribute("aria-pressed", "true");
      root.dataset.value = btn.dataset.value || btn.textContent.trim();
      onChange?.(root.dataset.value);
    })
  );
}
