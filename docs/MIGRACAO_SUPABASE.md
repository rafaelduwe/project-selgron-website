# Migração para Supabase — Plataforma Interna Selgron

## Escopo

1. **Banco de dados persistente** — OS e Reembolsos salvos mesmo após logout
2. **Autenticação real** — login/senha gerenciado pelo Supabase Auth
3. **Perfis de usuário** — tecnico / gestor / admin com permissões diferentes
4. **Painel admin/gestor** — histórico completo de OS e Reembolsos com filtros
5. **Gestão de usuários** — admin cria, edita e desativa usuários

---

## Perfis e permissões

| Perfil | Token | Reembolso | OS | Painel | Usuários |
|--------|-------|-----------|-----|--------|----------|
| tecnico | ✓ | Próprios | Próprias | ✗ | ✗ |
| gestor | ✓ | Todos (leitura) | Todas (leitura) | ✓ | ✗ |
| admin | ✓ | Todos | Todas | ✓ | ✓ |

---

## Schema do banco de dados

### Tabela: `profiles`
Estende o `auth.users` do Supabase.

```sql
create table profiles (
  id uuid references auth.users primary key,
  nome text not null,
  perfil text not null check (perfil in ('tecnico', 'gestor', 'admin')),
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Cria perfil automaticamente ao registrar usuário
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, nome, perfil)
  values (new.id, new.raw_user_meta_data->>'nome', coalesce(new.raw_user_meta_data->>'perfil', 'tecnico'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### Tabela: `ordens_servico`

```sql
create table ordens_servico (
  id text primary key,
  numero_os text,
  data_abertura text,
  usuario_id uuid references profiles(id),
  tecnico text,
  cliente text not null,
  cidade text not null,
  contato text,
  chassi text,
  modelo text,
  em_garantia boolean default false,
  fim_garantia text,
  motivo_visita text,
  km_rodados text,
  descricao_servico text,
  dias_horas jsonb default '[]',
  fotos_atendimento jsonb default '[]',
  pecas jsonb default '[]',
  assinatura_tecnico text,
  assinatura_cliente text,
  data_assinatura text,
  gerada boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Tabela: `relatorios_reembolso`

```sql
create table relatorios_reembolso (
  id text primary key,
  usuario_id uuid references profiles(id),
  tecnico text,
  clientes text,
  acompanhantes text,
  periodo text,
  observacoes text,
  notas jsonb default '[]',
  gerado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## Row Level Security (RLS)

```sql
-- Habilitar RLS
alter table profiles enable row level security;
alter table ordens_servico enable row level security;
alter table relatorios_reembolso enable row level security;

-- Helper: pega o perfil do usuário logado
create or replace function get_perfil()
returns text as $$
  select perfil from profiles where id = auth.uid();
$$ language sql security definer;

-- profiles: cada um vê o próprio, admin vê todos
create policy "profiles_select" on profiles for select
  using (id = auth.uid() or get_perfil() = 'admin');

create policy "profiles_update" on profiles for update
  using (get_perfil() = 'admin');

-- OS: tecnico vê as próprias, gestor/admin veem todas
create policy "os_select" on ordens_servico for select
  using (usuario_id = auth.uid() or get_perfil() in ('gestor', 'admin'));

create policy "os_insert" on ordens_servico for insert
  with check (usuario_id = auth.uid());

create policy "os_update" on ordens_servico for update
  using (usuario_id = auth.uid() or get_perfil() = 'admin');

-- Reembolso: mesma lógica
create policy "reembolso_select" on relatorios_reembolso for select
  using (usuario_id = auth.uid() or get_perfil() in ('gestor', 'admin'));

create policy "reembolso_insert" on relatorios_reembolso for insert
  with check (usuario_id = auth.uid());

create policy "reembolso_update" on relatorios_reembolso for update
  using (usuario_id = auth.uid() or get_perfil() = 'admin');
```

---

## Variáveis de ambiente

Criar arquivo `.env` na raiz do projeto (não commitar):

```
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

No Netlify: **Site Settings → Environment Variables** → adicionar as mesmas duas variáveis.

---

## Arquivos modificados

| Arquivo | O que muda |
|---------|-----------|
| `src/utils/supabase.ts` | **NOVO** — cliente Supabase |
| `src/utils/storage.ts` | Reescrito — funções viram async com chamadas Supabase |
| `App.tsx` | Auth via Supabase Session (onAuthStateChange) |
| `src/screens/LoginScreen.tsx` | usa `supabase.auth.signInWithPassword` |
| `src/screens/AdminScreen.tsx` | **NOVO** — painel admin/gestor |
| `src/screens/UserManagementScreen.tsx` | **NOVO** — gestão de usuários (admin) |
| `src/navigation/AppNavigator.tsx` | Sidebar mostra painel conforme perfil |

---

## Passos manuais (Supabase)

1. Criar conta em **supabase.com**
2. Criar novo projeto (região: South America)
3. Ir em **SQL Editor** e rodar os scripts acima em ordem
4. Ir em **Authentication → Users** e criar o primeiro usuário admin
5. Copiar `Project URL` e `anon key` de **Settings → API**
6. Colocar no `.env` local e no Netlify

---

## Testes previstos

- [ ] Login com usuário existente
- [ ] Login com usuário inválido (mensagem de erro)
- [ ] Criar OS, deslogar, logar novamente — OS persiste
- [ ] Criar Reembolso, fechar browser, reabrir — Reembolso persiste
- [ ] Usuário tecnico não vê OS de outro tecnico
- [ ] Gestor vê OS de todos os técnicos
- [ ] Admin consegue criar novo usuário
- [ ] Admin consegue desativar usuário
- [ ] Painel mostra histórico com nome do técnico e data

---

## O que NÃO muda

- Fluxo de preenchimento de OS (5 etapas)
- Fluxo de reembolso
- Geração de PDF
- Assinatura digital
- Gerador de token (offline, sem banco)
- Identidade visual
