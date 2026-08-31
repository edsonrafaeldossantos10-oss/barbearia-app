/* ============================================================
   config.js — Configuração da nuvem (Supabase)
   ============================================================

   COMO FUNCIONA
   -------------
   Enquanto os dois campos abaixo estiverem VAZIOS, o aplicativo roda em
   MODO LOCAL: cada barbeiro guarda os dados apenas no aparelho dele.
   Não existe banco central, não existe painel web e não existe backup
   automático.

   Assim que os dois campos forem preenchidos, o aplicativo entra em
   MODO NUVEM automaticamente, para todos os usuários, sem que o barbeiro
   precise digitar nada. É esse modo que liga:

     · o banco de dados central (fonte única de verdade)
     · o login único (mesmo e-mail e senha no app e no painel web)
     · o histórico compartilhado entre aplicativo, painel e agendamento

   COMO PREENCHER
   --------------
   1. Crie um projeto gratuito em supabase.com
   2. No painel do Supabase: Project Settings → Data API
   3. Copie "Project URL" para supabaseUrl
   4. Copie a chave "anon public" para supabaseAnonKey
   5. Rode o script banco/01-schema.sql no SQL Editor do Supabase
   6. Publique a pasta app/ no Netlify novamente

   SEGURANÇA
   ---------
   A chave "anon public" é feita para ficar visível no código do navegador.
   A proteção NÃO vem do sigilo dela: vem do Row Level Security (RLS) do
   banco, onde cada política compara a barbearia da linha com a barbearia
   do usuário autenticado.

   NUNCA use aqui a chave "service_role". Ela ignora o RLS e daria acesso
   a todos os dados de todas as barbearias.
   ============================================================ */

window.BARBEARIA_CONFIG = {
  supabaseUrl: 'https://srmcdhvmbafrkhfhxsfx.supabase.co',
  supabaseAnonKey: 'sb_publishable_jTxdyF6R4TDzc6FKAge5eg_5gqZPvRG'
};
