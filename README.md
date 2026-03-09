# KMS-M - Sistema de Controle de Quilometragem

Base funcional inicial com arquitetura modular:

- `frontend`: React + Vite
- `backend`: Node.js + Express
- `database`: SQLite (`backend/kmsm.sqlite`)

## Funcionalidades

- Login e cadastro com papéis: administrador, gerência e padrão
- Controle de permissões configurável e editável por administradores/gestores autorizados
- Dashboard com navegação lateral
- CRUD de registros de quilometragem (KMS-M)
- Relatórios automáticos (semanal e mensal)
- Gráficos interativos com Recharts
- Integração com Google Maps para visualizar rota
 codex/develop-complete-web-application-with-crud-mkocbb
- Preenchimento automático de endereço a partir do CEP (ViaCEP)
=======
 main

## Executando

### Backend

```bash
cd backend
npm install
npm run dev
```

Usuário inicial:

- Email: `admin@kmsm.local`
- Senha: `admin123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.
