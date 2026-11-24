# 🐾 PetGo

Aplicativo de delivery de ração e produtos para animais domésticos, no estilo iFood.
Projeto da disciplina de Engenharia Móvel.

Um único app com três perfis:

| Perfil | O que faz |
|---|---|
| **Cliente (tutor)** | Cadastra pets, encontra pet shops, compra, acompanha a entrega, assina recompra automática |
| **Loja** | Gerencia produtos, aceita pedidos, conversa com clientes, cria cupons |
| **Entregador** | Aceita entregas, segue a rota e compartilha a localização em tempo real |

## Tecnologias

- [Expo](https://expo.dev) SDK 58 + React Native + TypeScript
- Expo Router (navegação por arquivos em `src/app/`)
- Zustand (estado global)
- AsyncStorage (dados fictícios locais por enquanto)
- Firebase (Auth, Firestore, Storage, Cloud Messaging), a ser conectado

## Como rodar

Pré-requisitos: Node.js 20+ e o app **Expo Go** no celular.

```bash
npm install
npx expo start
```

Leia o QR code com o Expo Go (Android) ou com a câmera (iOS). Para abrir no navegador: `npx expo start --web`.

### Contas de demonstração

Senha de todas: `123456`. Na tela de login há atalhos para preenchê-las.

| Perfil | E-mail |
|---|---|
| Cliente | cliente@petgo.com |
| Loja | loja@petgo.com |
| Entregador | entregador@petgo.com |

### Verificações antes de subir código

```bash
npx tsc --noEmit
npx eslint .
```

## Estrutura

```
src/
├── app/                  # Telas (cada arquivo é uma rota)
│   ├── (auth)/           # Boas-vindas, login, cadastro
│   ├── cliente/          # Abas do cliente
│   ├── loja/             # Abas da loja
│   └── entregador/       # Abas do entregador
├── components/           # Componentes reutilizáveis (ui/ = botões, campos, tela)
├── data/seed.ts          # Dados fictícios (espécies, categorias, usuários demo)
├── services/             # Acesso a dados: interfaces + implementação mock
│   ├── types.ts          # Contratos (AuthService, ...)
│   ├── mock/             # Implementação local com AsyncStorage
│   └── index.ts          # Escolhe a implementação (mock → firebase)
├── store/                # Estado global (Zustand)
├── theme/                # Cores, espaçamentos e fontes do PetGo
└── types/models.ts       # Modelos: User, Pet, Store, Product, Order...
```

### Por que a camada `services/`?

As telas nunca acessam o banco diretamente: chamam `authService` (e, nas próximas fases,
`storeService`, `orderService`...). Hoje eles leem e gravam dados fictícios no aparelho.
Para conectar o Firebase basta criar `services/firebase/` com as mesmas interfaces e trocar
uma linha em `services/index.ts`, sem mexer nas telas.

Espécies também são dados (`data/seed.ts`), não código: para incluir pássaros, peixes etc.
basta cadastrar uma nova espécie.

## Roadmap

- [x] **Fase 1: Base.** Tema visual, navegação por perfil, cadastro, login e logout (mock)
- [ ] **Fase 2: Compra (cliente).** Pets, home, lojas, busca e filtros, produto, carrinho, checkout
- [ ] **Fase 3: Loja.** Painel de pedidos e cadastro de produtos
- [ ] **Fase 4: Entregador.** Fluxo de entrega e rastreio no mapa
- [ ] **Fase 5: Extras.** Chat, avaliações, cupons, favoritos, assinaturas, lembretes de ração e notificações
- [ ] **Fase 6: Entrega.** Firebase, dados de exemplo e APK via EAS Build
