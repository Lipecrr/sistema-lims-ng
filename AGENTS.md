# AGENTS.md - Contexto do Projeto Sistema LIMS

> Arquivo de contexto para assistentes de IA. Atualizado em: 2026-05-25

---

## 📋 Visão Geral

| Propriedade | Valor |
|-------------|-------|
| **Nome** | Sistema LIMS (Laboratory Information Management System) |
| **Framework** | Angular 21.1.3 |
| **Linguagem** | TypeScript 5.x |
| **Gerenciador de Pacotes** | NPM 11.6.1 |
| **Prefixo de Componentes** | `app` |

---

## 🏗️ Stack Tecnológico

### Core
- **Angular 21.1.3** (Standalone Components, SSR)
- **TypeScript 5.x**
- **RxJS 7.8**

### UI/UX
- **Tailwind CSS 4.1.18** - Framework CSS utilitário
- **PrimeNG 21.1.1** - Componentes UI
- **PrimeIcons 7.0.0** - Ícones
- **@primeuix/themes 2.0.3** - Temas

### Ícones
- **FontAwesome 7.1.0** (`@fortawesome/fontawesome-free`)
- **Lucide Angular 1.16.0** (`@lucide/angular`, `lucide-angular`)

### Internacionalização (i18n)
- **Transloco 8.2.0** (`@jsverse/transloco`)
- **NGX-Translate 17.0.0** (`@ngx-translate/core`)

### Datas e Gráficos
- **date-fns 4.1.0** - Manipulação de datas
- **Chart.js 4.5.1** - Gráficos

### Build/Deploy
- **Angular SSR** - Server-Side Rendering
- **Express 5.1.0** - Servidor para SSR

---

## 📁 Estrutura de Diretórios

```
sistema-lims-ng/
├── public/                         # Assets públicos
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── components/         # Componentes compartilhados
│   │   │       ├── registro-status-tag/
│   │   │       │   ├── registro-status-tag.ts
│   │   │       │   └── registro-status-tag.html
│   │   │       └── sidebar/
│   │   │           ├── sidebar.ts
│   │   │           └── sidebar.html
│   │   │
│   │   ├── models/                 # Interfaces/Models TypeScript
│   │   │   ├── analise.model.ts
│   │   │   ├── cliente.model.ts
│   │   │   ├── colaborador.model.ts
│   │   │   ├── metodologia.model.ts
│   │   │   ├── tipo-amostra.model.ts
│   │   │   └── tipo-atividade.model.ts
│   │   │
│   │   ├── pages/                  # Páginas/Módulos
│   │   │   ├── clientes/
│   │   │   │   ├── create/         # Cadastro
│   │   │   │   │   ├── cliente-cadastro.ts
│   │   │   │   │   └── cliente-cadastro.html
│   │   │   │   └── list/           # Listagem
│   │   │   │       ├── list.ts
│   │   │   │       └── list.html
│   │   │   │
│   │   │   ├── colaboradores/
│   │   │   │   ├── create/
│   │   │   │   │   ├── colaborador-cadastro.ts
│   │   │   │   │   └── colaborador-cadastro.html
│   │   │   │   └── list/
│   │   │   │       ├── list.ts
│   │   │   │       └── list.html
│   │   │   │
│   │   │   ├── metodologias/
│   │   │   │   ├── create/
│   │   │   │   │   ├── metodologia-cadastro.ts
│   │   │   │   │   └── metodologia-cadastro.html
│   │   │   │   └── list/
│   │   │   │       ├── metodologias-list.ts
│   │   │   │       ├── metodologias-list.html
│   │   │   │       └── tempo-estimado.pipe.ts
│   │   │   │
│   │   │   ├── tipos-amostras/
│   │   │   │   ├── create/
│   │   │   │   │   ├── tipo-amostra-cadastro.ts
│   │   │   │   │   └── tipo-amostra-cadastro.html
│   │   │   │   └── list/
│   │   │   │       ├── list.ts
│   │   │   │       └── list.html
│   │   │   │
│   │   │   └── tipos-atividades/
│   │   │       ├── create/
│   │   │       │   ├── tipo-atividade-cadastro.ts
│   │   │       │   └── tipo-atividade-cadastro.html
│   │   │       └── list/
│   │   │           ├── list.ts
│   │   │           └── list.html
│   │   │
│   │   ├── services/               # Serviços HTTP/API
│   │   │   ├── metodologia-cadastro.service.ts
│   │   │   ├── metodologias-list.service.ts
│   │   │   ├── tipos-amostras.service.ts
│   │   │   └── tipos-atividades.service.ts
│   │   │
│   │   ├── app.config.ts           # Configuração Angular
│   │   ├── app.config.server.ts    # Config SSR
│   │   ├── app.html                # Template root
│   │   ├── app.routes.ts           # Rotas
│   │   ├── app.routes.server.ts    # Rotas SSR
│   │   ├── app.scss                # Estilos globais
│   │   ├── app.spec.ts             # Testes
│   │   └── app.ts                  # Componente root
│   │
│   ├── assets/
│   │   ├── styles.scss             # Estilos globais
│   │   └── tailwind.css            # Config Tailwind
│   │
│   ├── environment/
│   │   └── environment.ts           # Variáveis de ambiente
│   │
│   ├── index.html                  # HTML principal
│   ├── main.ts                     # Bootstrap
│   ├── main.server.ts              # Bootstrap SSR
│   └── server.ts                   # Servidor Express SSR
│
├── .vscode/                        # Configurações VS Code
│   ├── extensions.json
│   ├── launch.json
│   ├── mcp.json
│   └── tasks.json
│
├── angular.json                    # Config Angular CLI
├── package.json                    # Dependências
├── package-lock.json
├── tsconfig.json                   # Config TypeScript
├── tsconfig.app.json
├── tsconfig.spec.json
├── .editorconfig
├── .gitignore
├── .postcssrc.json
└── README.md
```

---

## 🎯 Módulos do Sistema

### Cadastros Implementados

| Módulo | Modelo | Serviço | Pipe | Descrição |
|--------|--------|---------|------|-----------|
| **Clientes** | `cliente.model.ts` | ❌ | ❌ | Gestão de clientes |
| **Colaboradores** | `colaborador.model.ts` | ❌ | ❌ | Gestão de laboratoristas |
| **Metodologias** | `metodologia.model.ts` | ✅ | `tempo-estimado.pipe.ts` | Métodos de análise |
| **Tipos de Amostras** | `tipo-amostra.model.ts` | ✅ | ❌ | Categorias de amostras |
| **Tipos de Atividades** | `tipo-atividade.model.ts` | ✅ | ❌ | Tipos de tarefas laboratoriais |
| **Análises** | `analise.model.ts` | ❌ | ❌ | Registro de análises |

### Padrão de Componentes

Cada módulo segue a estrutura padrão:

```
pages/[modulo]/
├── create/                    # Formulário de cadastro/edição
│   ├── [modulo]-cadastro.ts
│   └── [modulo]-cadastro.html
│
└── list/                      # Grid/Listagem
    ├── list.ts
    └── list.html
```

**Observação:** O módulo `metodologias` usa `metodologias-list.ts` (nome diferente do padrão).

---

## 🔧 Configurações Específicas

### Prettier (em package.json)
```json
{
  "printWidth": 100,
  "singleQuote": true,
  "overrides": [{"files": "*.html", "options": {"parser": "angular"}}]
}
```

### Estilos Globais
- **SCSS** - Estilos componentes e globais
- **Tailwind CSS** - Classes utilitárias
- **PrimeNG** - Componentes UI

### Scripts Disponíveis
```bash
npm start          # ng serve (desenvolvimento)
npm run build      # Build de produção
npm run watch      # Build com watch
npm test           # Testes com Vitest
npm run serve:ssr  # SSR com Node
```

---

## 📝 Notas para Desenvolvimento

### Convenções de Código
1. **Standalone Components** - Todos os componentes são standalone
2. **Padrão de Nomenclatura**:
   - Componentes: `[nome].ts` (ex: `cliente-cadastro.ts`)
   - Templates: `[nome].html`
   - Serviços: `[nome].service.ts`
   - Models: `[nome].model.ts`
3. **Imports** - Usar caminhos absolutos `@app/...` quando configurado

### Componentes Compartilhados
- `app-sidebar` - Menu lateral de navegação
- `app-registro-status-tag` - Badge de status (ativo/inativo)

### Pipes Disponíveis
- `tempoEstimado` - Formata tempo estimado (usado em metodologias)

---

## 🐛 Possíveis Problemas / Melhorias

1. **Inconsistência de Nomenclatura**: 
   - `metodologias-list.ts` vs `list.ts` em outros módulos
   
2. **Serviços Incompletos**:
   - Clientes e Colaboradores não têm services implementados

3. **Modelo Análise**: Modelo definido (`analise.model.ts`) mas sem páginas implementadas

---

## 📚 Recursos Adicionais

- [Angular Docs](https://angular.dev/)
- [PrimeNG Docs](https://primeng.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Transloco Docs](https://jsverse.github.io/transloco/)

---

*Gerado automaticamente. Última atualização: 2026-05-25*
