import { sb } from "./supabaseClient.js";
const el=(id)=>document.getElementById(id);
export const BRL=(v)=>(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
export function toast(msg){const t=el("toast"); if(!t){alert(msg);return;} t.textContent=msg; t.style.display="block"; clearTimeout(window.__t); window.__t=setTimeout(()=>t.style.display="none",2600);}
export async function requireAuth(){const {data}=await sb.auth.getSession(); if(!data.session){location.href="index.html"; return null;} return data.session.user;}
export async function ensureProfile(){const user=await requireAuth(); if(!user) return null;
  const {data:prof, error}=await sb.from("profiles2").select("id,nome,role").eq("id", user.id).single();
  if(error){toast("Perfil não encontrado. Crie em profiles2 (id=user.id)."); throw error;}
  return {user, prof};
}
export async function logout(){await sb.auth.signOut(); location.href="index.html";}
export function periodStart(kind){const d=new Date(); if(kind==="all") return new Date("2000-01-01T00:00:00"); if(kind==="mtd") return new Date(d.getFullYear(), d.getMonth(), 1); const days=Number(kind); const s=new Date(); s.setDate(s.getDate()-days); return s;}
export function bindChipGroup(groupId, onChange){const root=el(groupId); if(!root) return;
  root.querySelectorAll(".chip").forEach(btn=>btn.addEventListener("click",()=>{root.querySelectorAll(".chip").forEach(b=>b.setAttribute("aria-pressed","false"));
    btn.setAttribute("aria-pressed","true"); root.dataset.value=btn.dataset.value||btn.textContent.trim(); onChange?.(root.dataset.value);}));}
