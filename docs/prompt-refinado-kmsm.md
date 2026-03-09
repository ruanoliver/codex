# Prompt Refinado — Sistema Web de Gestão de Registros e Quilometragem

Você é um(a) engenheiro(a) de software sênior responsável por **projetar e implementar uma aplicação web fullstack completa**, acessível pelo navegador, com foco em:

- arquitetura profissional e escalável;
- código limpo e modular;
- segurança e validação de ponta a ponta;
- experiência moderna (dark mode, responsiva, rápida).

> Objetivo: entregar uma base sólida de produto pronta para evolução contínua, evitando “gambiarra acidental orientada a prazo”.

---

## 1) Requisitos funcionais obrigatórios

Implemente os módulos abaixo com funcionamento real (não apenas mock):

1. **Autenticação e sessão**
   - Login com CPF + senha.
   - Cadastro de usuário.
   - Logout.
   - Sessão autenticada com JWT.
   - Proteção de rotas no frontend e backend.

2. **Sistema de permissões (RBAC)**
   - Níveis:
     - `viewer` (visualização + adicionar)
     - `editor` (viewer + editar campos permitidos)
     - `admin` (controle total, incluindo usuários e permissões)
   - Apenas `admin` pode alterar permissões de outros usuários.

3. **CRUD de registros**
   - Criar, listar, editar, excluir.
   - Busca textual.
   - Filtro por data/período.
   - Paginação básica na listagem.

4. **Dashboard**
   - Cards com métricas principais.
   - Navegação lateral.
   - Atalhos para páginas principais.

5. **Validações e qualidade de dados**
   - CPF válido (algoritmo de validação).
   - CPF único.
   - Senha com regra mínima.
   - Sanitização básica de entrada.

6. **Exportação e rastreabilidade**
   - Exportar registros para CSV e JSON.
   - Histórico de alterações (quem alterou e quando).
   - Log simples de eventos críticos (login, criação/edição/exclusão).

---

## 2) Requisitos de UX/UI

- Interface em **dark mode por padrão**.
- Layout moderno, minimalista e responsivo (desktop, tablet e mobile).
- Fluxos claros com feedback visual (loading, erro, sucesso, vazio).
- Acessibilidade mínima:
  - contraste adequado;
  - navegação por teclado nos elementos principais;
  - labels e mensagens de erro legíveis.

### Tela inicial (Login)
Exibir apenas:
- CPF/usuário
- senha
- botão Entrar
- botão Criar conta

Após login válido, redirecionar para dashboard.

---

## 3) Stack recomendada (preferencial)

### Frontend
- React + Vite
- TailwindCSS
- Axios
- React Router
- Zustand **ou** Context API
- date-fns

### Backend
- Node.js + Express
- Validação com Zod **ou** Joi
- bcrypt
- JWT
- dotenv
- UUID

### Banco
- SQLite (MVP) com estrutura preparada para PostgreSQL.

---

## 4) Arquitetura e organização do projeto

Use estrutura em camadas e responsabilidade única:

```txt
/project
  /backend
    /src
      /config
      /controllers
      /routes
      /middleware
      /services
      /repositories
      /models
      /validators
      /auth
      /database
      app.js
      server.js
  /frontend
    /src
      /components
      /pages
      /services
      /hooks
      /store
      /layouts
      /styles
      /routes
      main.jsx
```

### Regras arquiteturais
- Controllers não contêm regra de negócio complexa.
- Regras de negócio ficam em `services`.
- Acesso a dados em `repositories`.
- Validação centralizada em `validators`.
- Middlewares para autenticação/autorização e tratamento de erro.

---

## 5) Modelagem de dados mínima

### Tabela `usuarios`
- id (uuid ou autoincrement)
- nome
- cpf (único)
- senha_hash
- permissao (`viewer` | `editor` | `admin`)
- ativo (boolean)
- data_criacao
- data_atualizacao

### Tabela `registros`
- id
- usuario_id (FK)
- origem
- endereco
- data
- hora
- descricao
- acoes_executadas
- data_criacao
- data_atualizacao

### Tabela `historico_alteracoes`
- id
- entidade (`usuario` | `registro`)
- entidade_id
- alterado_por
- tipo_alteracao (`create` | `update` | `delete`)
- diff_resumido
- data_evento

### Tabela `logs_sistema`
- id
- usuario_id (nullable)
- evento
- metadata_json
- data_evento

---

## 6) Regras de segurança obrigatórias

- Senha com hash (`bcrypt`) e nunca armazenada em texto puro.
- JWT com expiração e segredo via variável de ambiente.
- Proteção de rotas por perfil (RBAC).
- Validação de entrada em todas as rotas de escrita.
- Sanitização básica para campos textuais.
- Rate limit simples no login.
- CORS configurado explicitamente.

---

## 7) Regras de qualidade de código

- Código limpo, legível e com nomes descritivos.
- Evitar duplicação de lógica (DRY).
- Funções curtas e coesas.
- Comentários apenas quando agregarem contexto.
- Humor técnico permitido com moderação, por exemplo:

```js
// Se você está lendo isso às 3 da manhã,
// respira: o bug provavelmente é dado inválido,
// não maldição ancestral do JavaScript.
```

---

## 8) Entregáveis esperados

1. Código backend e frontend funcionais.
2. Arquivo `.env.example` com variáveis necessárias.
3. Scripts de execução (`dev`, `build`, `start`).
4. README com:
   - arquitetura;
   - instruções de setup;
   - fluxo de autenticação;
   - perfis de acesso;
   - decisões técnicas e limitações conhecidas.
5. Coleção de rotas (ex.: arquivo de requests) ou documentação dos endpoints.

---

## 9) Critérios de aceite (Definition of Done)

Considere a entrega concluída apenas se:

- [ ] Usuário consegue cadastrar e autenticar com CPF válido.
- [ ] RBAC impede acesso indevido em frontend e backend.
- [ ] CRUD completo de registros funciona com validação.
- [ ] Busca, filtro e paginação funcionam.
- [ ] Exportação CSV/JSON funciona.
- [ ] Histórico de alterações e logs registram eventos críticos.
- [ ] Interface dark mode está consistente e responsiva.
- [ ] Projeto está modular e documentado.

---

## 10) Instrução final de implementação

Implemente a solução **com foco em robustez e manutenibilidade**, priorizando clareza arquitetural, segurança e experiência do usuário. Se houver trade-offs, documente no README com justificativa.
