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
- Zustand (estado global, sacola persistida)
- AsyncStorage (dados fictícios locais por enquanto)
- react-native-maps (mapa das lojas) e expo-image-picker (foto do pet)
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
├── data/                 # Dados fictícios: seed.ts (espécies, categorias, usuários) e catalog.ts (lojas, produtos)
├── hooks/                # useAsync (carregar dados), useAddToCart, useReorder...
├── services/             # Acesso a dados: interfaces + implementação mock
│   ├── types.ts          # Contratos (AuthService, ...)
│   ├── mock/             # Implementação local com AsyncStorage
│   └── index.ts          # Escolhe a implementação (mock → firebase)
├── store/                # Estado global (Zustand): auth e sacola
├── utils/                # Formatação, filtros de produto, distância, regras dos pets
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

## Dados fictícios

- 5 pet shops em São Paulo (um deles fechado, para testar esse estado) e 80 produtos em 5 categorias.
- Marcas fictícias (NutriDog, FelinoPlus, VitaCão...).
- A cliente demo já tem 2 pets (Thor, cachorro; Mia, gata) e 1 endereço.
- Tudo fica salvo no aparelho. Para voltar ao estado inicial, limpe os dados do app (ou, na web, o armazenamento do site).

### Testando cliente e loja juntos

Como os dados ficam no próprio aparelho, dá para simular os dois lados:
faça um pedido com `cliente@petgo.com`, saia, entre com `loja@petgo.com`
(dona do *Pet Shop Amigo Fiel*) e aceite/prepare o pedido. Ao voltar para a
conta do cliente, o status estará atualizado. Com o Firebase, isso passa a
funcionar entre aparelhos diferentes, em tempo real.

Uma loja nova cadastrada pelo app começa fechada e sem endereço; ela só aparece
para os clientes depois que o dono preenche o endereço em **Minha loja**.

### Recomendações

O produto "serve" para um pet quando bate a espécie, o porte e a fase da vida
(filhote < 1 ano; sênior a partir de 7 anos para cães e 10 para gatos). Veja `src/utils/pets.ts`.

## Observações para o APK

- O mapa no Android usa Google Maps: para o APK final é preciso uma chave da API do Google Maps
  em `app.json` (`android.config.googleMaps.apiKey`). No Expo Go funciona sem chave.
- Na versão web o mapa é substituído por um desenho simplificado (`StoresMap.web.tsx`).

## Roadmap

- [x] **Fase 1: Base.** Tema visual, navegação por perfil, cadastro, login e logout (mock)
- [x] **Fase 2: Compra (cliente).** Pets, endereços, home com recomendações, lojas e mapa, busca e filtros, produto, sacola, checkout, acompanhamento e histórico de pedidos
- [x] **Fase 3: Loja.** Pedidos em tempo real (aceitar, recusar com motivo, separar, pronto), cadastro de produtos com foto e estoque, dados da loja e abrir/fechar
- [ ] **Fase 4: Entregador.** Fluxo de entrega e rastreio no mapa
- [ ] **Fase 5: Extras.** Chat, avaliações, cupons, favoritos, assinaturas, lembretes de ração e notificações
- [ ] **Fase 6: Entrega.** Firebase, dados de exemplo e APK via EAS Build
