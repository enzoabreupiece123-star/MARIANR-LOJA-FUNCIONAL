# Guia Completo: Publicando a Loja Mariane Moreira Concepts no Render com Supabase (100% Grátis)

Este guia prático foi preparado especialmente para você colocar a sua loja de roupas no ar de forma gratuita, profissional e com banco de dados em nuvem.

---

## 🌟 Visão Geral da Arquitetura
1. **Frontend da Loja:** Hospedado gratuitamente na **Render** (como Static Site com HTTPS e CDN rápida).
2. **Banco de Dados:** Hospedado gratuitamente no **Supabase** (PostgreSQL em nuvem para guardar produtos, fotos e preços).
3. **Vendas & Atendimento:** Redirecionamento automático e inteligente direto para o **WhatsApp da Mariane** com o resumo completo do pedido.
4. **Pagamento:** Chave Pix cadastrada com botão de "Copiar Chave Pix" na finalização do pedido.

---

## 1️⃣ Passo 1: Criar o Banco de Dados no Supabase (Grátis)

1. Acesse o site oficial: **[supabase.com](https://supabase.com)** e clique em **"Start your project"** (crie sua conta com e-mail ou GitHub).
2. Clique em **"New project"**:
   - **Name:** `mariane-moreira-store`
   - **Database Password:** Escolha uma senha segura e anote.
   - **Region:** Selecione `South America (São Paulo)` para máxima velocidade no Brasil.
   - Clique em **"Create new project"** e aguarde cerca de 1 minuto.
3. No menu lateral esquerdo do Supabase, clique no ícone **"SQL Editor"** (ícone de terminal `>_`).
4. Clique em **"New query"** e cole todo o conteúdo do arquivo `supabase-schema.sql` (disponível na raiz deste projeto).
5. Clique no botão verde **"Run"** (no canto inferior direito do editor SQL). Pronto! As tabelas de produtos e políticas de segurança já estão criadas.
6. Pegue as suas chaves de acesso:
   - No menu lateral, clique na engrenagem de configurações **"Project Settings"** > **"API"**.
   - Copie o **Project URL** (ex: `https://xyzabcdefg.supabase.co`).
   - Copie a chave **Project API Keys** chamada `anon` / `public`.

---

## 2️⃣ Passo 2: Subir o Código para o GitHub

1. Crie uma conta gratuita no **[github.com](https://github.com)** se ainda não tiver.
2. Crie um novo repositório chamado `mariane-moreira-concepts`.
3. Envie os arquivos do projeto para este repositório no GitHub.

---

## 3️⃣ Passo 3: Hospedar Gratuitamente na Render (Passo a Passo)

1. Acesse **[render.com](https://render.com)** e crie sua conta gratuita (pode entrar usando o seu GitHub).
2. No painel principal da Render, clique no botão azul **"New +"** e selecione **"Static Site"**.
3. Conecte o repositório GitHub que você criou no Passo 2.
4. Configure os campos da seguinte forma:
   - **Name:** `mariane-moreira-concepts` (ou o nome que preferir)
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Na seção **"Environment Variables"** (Variáveis de Ambiente), clique em **"Add Environment Variable"** e adicione:
   - `VITE_SUPABASE_URL` = (Cole o seu Project URL do Supabase)
   - `VITE_SUPABASE_ANON_KEY` = (Cole sua chave anon/public do Supabase)
   - `VITE_STORE_WHATSAPP` = `5511999999999` (Substitua com o DDD e celular do WhatsApp da loja)
   - `VITE_STORE_PIX_KEY` = `suachavepix@aqui.com` (Sua chave Pix)
   - `VITE_STORE_PIX_NAME` = `Mariane Moreira Concepts`
6. Clique no botão **"Create Static Site"**.
7. O Render vai compilar e gerar o seu link oficial gratuito (ex: `https://mariane-moreira-concepts.onrender.com`).
8. Você também pode conectar seu domínio próprio (ex: `www.marianemoreiraconcepts.com.br`) na Render gratuitamente com SSL grátis!

---

## 4️⃣ Como a Dona (Mariane) cadastra roupas e altera preços

- A dona da loja pode acessar o painel administrativo clicando em **"Área Administrativa"** no rodapé do site ou no ícone da chave no menu.
- Digite o PIN de segurança padrão: **`1234`** (que você pode alterar nas configurações a qualquer momento).
- No painel da dona:
  - ➕ **Cadastrar Nova Peça:** Defina nome, categoria, preço à vista, preço anterior (para aparecer como promoção), tamanhos (P, M, G, 38, 40...), cores e link da foto.
  - ✏️ **Editar e Excluir:** Altere preços e status de estoque (Disponível ou Esgotado) com apenas 1 clique.
  - 🏷️ **Categorias:** Crie quantas categorias quiser (ex: Vestidos, Lançamentos, Alfaiataria, Moda Praia).
  - 💳 **Configurações:** Altere seu número de WhatsApp e sua Chave Pix quando desejar.

---

## 5️⃣ Como a Cliente faz o Pedido no WhatsApp
1. A cliente navega pela coleção, filtra por categoria ou pesquisa sua peça favorita.
2. Clica na peça, escolhe o tamanho desejado e a cor.
3. Adiciona à sacola de compras.
4. Na sacola, insere seu nome, WhatsApp e escolhe se quer retirar no ateliê ou receber em casa (com endereço).
5. O sistema calcula o valor total, exibe a chave Pix para pagamento e gera o botão **"Finalizar Pedido no WhatsApp"**.
6. A cliente é redirecionada direto para o WhatsApp da Mariane com todos os detalhes prontos para o atendimento!
