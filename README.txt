CRM Vegas — MVP REAL com Supabase (HTML)
1) Supabase → Settings → API: copie URL + anon key e cole em assets/supabaseClient.js
2) Supabase → SQL Editor: rode supabase_schema.sql
3) Auth → Users: crie usuários (email/senha)
4) Table editor → profiles: insira uma linha por usuário (id = user.id, role=vendedor|gestor|adm)

Rodar local (recomendado, por causa de <script type="module">):
- Abra um terminal na pasta e rode:
  python -m http.server 8000
- Acesse: http://localhost:8000

Hospedar:
- Pode subir essa pasta em Vercel/Netlify como site estático (sem build).
