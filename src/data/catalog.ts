import type { CategoryId, LifeStage, PetSize, Product, Review, Store } from '@/types/models';

/**
 * Catálogo fictício: 5 pet shops em São Paulo e ~23 produtos-base.
 * Marcas fictícias. Cada loja vende uma seleção com preços próprios.
 */

const ALL_SIZES: PetSize[] = ['mini', 'pequeno', 'medio', 'grande', 'gigante'];

interface BaseProduct {
  id: string;
  categoryId: CategoryId;
  name: string;
  brand: string;
  description: string;
  price: number;
  speciesIds: string[];
  sizes?: PetSize[];
  lifeStages?: LifeStage[];
  packageKg?: number;
  requiresPrescription?: boolean;
}

const base: BaseProduct[] = [
  // Ração
  {
    id: 'nutridog-adulto-mg-15',
    categoryId: 'racao',
    name: 'Ração NutriDog Adulto Raças Médias e Grandes 15 kg',
    brand: 'NutriDog',
    description:
      'Alimento completo para cães adultos de porte médio a gigante. Rica em proteínas, com ômega 3 e 6 para pele e pelagem saudáveis e glucosamina para as articulações.',
    price: 189.9,
    speciesIds: ['cachorro'],
    sizes: ['medio', 'grande', 'gigante'],
    lifeStages: ['adulto'],
    packageKg: 15,
  },
  {
    id: 'nutridog-light-15',
    categoryId: 'racao',
    name: 'Ração NutriDog Light Adulto 15 kg',
    brand: 'NutriDog',
    description: 'Fórmula com menos calorias para cães adultos com tendência ao sobrepeso ou castrados.',
    price: 199.9,
    speciesIds: ['cachorro'],
    sizes: ['medio', 'grande'],
    lifeStages: ['adulto'],
    packageKg: 15,
  },
  {
    id: 'nutridog-filhote-p-3',
    categoryId: 'racao',
    name: 'Ração NutriDog Filhote Raças Pequenas 3 kg',
    brand: 'NutriDog',
    description: 'Croquetes pequenos e macios, com DHA para o desenvolvimento cerebral de filhotes de porte mini e pequeno.',
    price: 69.9,
    speciesIds: ['cachorro'],
    sizes: ['mini', 'pequeno'],
    lifeStages: ['filhote'],
    packageKg: 3,
  },
  {
    id: 'premiumpet-adulto-p-75',
    categoryId: 'racao',
    name: 'Ração PremiumPet Adulto Raças Pequenas 7,5 kg',
    brand: 'PremiumPet',
    description: 'Super premium, sem corantes artificiais, com alta palatabilidade para cães exigentes de pequeno porte.',
    price: 139.9,
    speciesIds: ['cachorro'],
    sizes: ['mini', 'pequeno'],
    lifeStages: ['adulto'],
    packageKg: 7.5,
  },
  {
    id: 'vitacao-senior-10',
    categoryId: 'racao',
    name: 'Ração VitaCão Sênior 7+ 10 kg',
    brand: 'VitaCão',
    description: 'Para cães a partir de 7 anos. Com antioxidantes, L-carnitina e fibras de fácil digestão.',
    price: 159.9,
    speciesIds: ['cachorro'],
    sizes: ALL_SIZES,
    lifeStages: ['senior'],
    packageKg: 10,
  },
  {
    id: 'felinoplus-castrado-10',
    categoryId: 'racao',
    name: 'Ração FelinoPlus Gatos Adultos Castrados 10 kg',
    brand: 'FelinoPlus',
    description: 'Controle de peso e saúde do trato urinário para gatos castrados. Sabor salmão.',
    price: 179.9,
    speciesIds: ['gato'],
    lifeStages: ['adulto'],
    packageKg: 10,
  },
  {
    id: 'felinoplus-filhote-1',
    categoryId: 'racao',
    name: 'Ração FelinoPlus Filhotes 1 kg',
    brand: 'FelinoPlus',
    description: 'Para gatinhos de 2 a 12 meses. Croquetes pequenos, com cálcio e DHA.',
    price: 39.9,
    speciesIds: ['gato'],
    lifeStages: ['filhote'],
    packageKg: 1,
  },
  {
    id: 'gatofeliz-senior-3',
    categoryId: 'racao',
    name: 'Ração GatoFeliz Sênior 3 kg',
    brand: 'GatoFeliz',
    description: 'Para gatos a partir de 10 anos, com suporte renal e croquetes fáceis de mastigar.',
    price: 89.9,
    speciesIds: ['gato'],
    lifeStages: ['senior'],
    packageKg: 3,
  },
  // Petiscos
  {
    id: 'bifinho-carne-500',
    categoryId: 'petiscos',
    name: 'Bifinho Sabor Carne 500 g',
    brand: 'NutriDog',
    description: 'Petisco macio para recompensar e treinar. Ideal para cães de todos os portes.',
    price: 24.9,
    speciesIds: ['cachorro'],
  },
  {
    id: 'osso-natural',
    categoryId: 'petiscos',
    name: 'Osso Natural Mastigável',
    brand: 'VitaCão',
    description: 'Osso bovino desidratado que ajuda na limpeza dos dentes e diverte por horas.',
    price: 19.9,
    speciesIds: ['cachorro'],
    sizes: ['medio', 'grande', 'gigante'],
  },
  {
    id: 'petisco-dental-p',
    categoryId: 'petiscos',
    name: 'Petisco Dental Cães Pequenos 7 unidades',
    brand: 'PremiumPet',
    description: 'Reduz o tártaro e o mau hálito. Uma unidade por dia.',
    price: 22.9,
    speciesIds: ['cachorro'],
    sizes: ['mini', 'pequeno'],
  },
  {
    id: 'sache-salmao',
    categoryId: 'petiscos',
    name: 'Sachê FelinoPlus Salmão ao Molho 85 g',
    brand: 'FelinoPlus',
    description: 'Alimento úmido completo para gatos adultos.',
    price: 3.49,
    speciesIds: ['gato'],
  },
  // Higiene
  {
    id: 'areia-graos-finos-4',
    categoryId: 'higiene',
    name: 'Areia Sanitária Grãos Finos 4 kg',
    brand: 'GatoFeliz',
    description: 'Forma torrões firmes, fácil de limpar e com controle de odores.',
    price: 29.9,
    speciesIds: ['gato'],
    packageKg: 4,
  },
  {
    id: 'areia-silica-16',
    categoryId: 'higiene',
    name: 'Areia de Sílica 1,6 kg',
    brand: 'FelinoPlus',
    description: 'Absorção máxima, rende até 30 dias para um gato.',
    price: 34.9,
    speciesIds: ['gato'],
    packageKg: 1.6,
  },
  {
    id: 'tapete-higienico-30',
    categoryId: 'higiene',
    name: 'Tapete Higiênico 30 unidades',
    brand: 'PetMax',
    description: 'Gel superabsorvente e atrativo para ensinar o local certo.',
    price: 54.9,
    speciesIds: ['cachorro'],
  },
  {
    id: 'shampoo-neutro',
    categoryId: 'higiene',
    name: 'Shampoo Neutro Cães e Gatos 500 ml',
    brand: 'PetMax',
    description: 'pH balanceado, sem perfume forte. Para peles sensíveis.',
    price: 27.9,
    speciesIds: ['cachorro', 'gato'],
  },
  // Brinquedos
  {
    id: 'bolinha-borracha',
    categoryId: 'brinquedos',
    name: 'Bolinha de Borracha Resistente',
    brand: 'PetMax',
    description: 'Quica de forma imprevisível e aguenta mordidas fortes.',
    price: 14.9,
    speciesIds: ['cachorro'],
  },
  {
    id: 'corda-mordedor',
    categoryId: 'brinquedos',
    name: 'Corda Mordedor com Nós',
    brand: 'PetMax',
    description: 'Para cabo de guerra e limpeza dos dentes.',
    price: 19.9,
    speciesIds: ['cachorro'],
  },
  {
    id: 'varinha-penas',
    categoryId: 'brinquedos',
    name: 'Varinha com Penas e Guizo',
    brand: 'GatoFeliz',
    description: 'Estimula o instinto de caça e faz o gato se exercitar.',
    price: 16.9,
    speciesIds: ['gato'],
  },
  {
    id: 'arranhador-compacto',
    categoryId: 'brinquedos',
    name: 'Arranhador Compacto de Sisal',
    brand: 'GatoFeliz',
    description: 'Protege os móveis e ajuda a manter as unhas saudáveis. 45 cm.',
    price: 89.9,
    speciesIds: ['gato'],
  },
  // Remédios
  {
    id: 'antipulgas-10-20',
    categoryId: 'remedios',
    name: 'Antipulgas Cães 10 a 20 kg (3 comprimidos)',
    brand: 'VetCare',
    description: 'Proteção contra pulgas e carrapatos por até 3 meses. Comprimido mastigável.',
    price: 119.9,
    speciesIds: ['cachorro'],
    sizes: ['medio'],
  },
  {
    id: 'vermifugo-gatos',
    categoryId: 'remedios',
    name: 'Vermífugo Gatos (2 comprimidos)',
    brand: 'VetCare',
    description: 'Amplo espectro contra vermes intestinais.',
    price: 34.9,
    speciesIds: ['gato'],
  },
  {
    id: 'antibiotico-vet',
    categoryId: 'remedios',
    name: 'Antibiótico Veterinário 10 comprimidos',
    brand: 'VetCare',
    description: 'Uso somente com prescrição do médico-veterinário.',
    price: 59.9,
    speciesIds: ['cachorro', 'gato'],
    requiresPrescription: true,
  },
];

export const seedStores: Store[] = [
  {
    id: 'store_1',
    ownerId: 'user_loja',
    name: 'Pet Shop Amigo Fiel',
    description: 'Tudo para cães e gatos, com entrega rápida na região da Paulista.',
    address: { street: 'Rua Augusta', number: '1500', district: 'Consolação', city: 'São Paulo', state: 'SP', zip: '01304-001', lat: -23.5567, lng: -46.6608 },
    rating: 4.8,
    ratingCount: 312,
    deliveryFee: 5.99,
    deliveryTimeMin: 25,
    deliveryTimeMax: 40,
    minOrder: 30,
    isOpen: true,
    speciesIds: ['cachorro', 'gato'],
  },
  {
    id: 'store_2',
    ownerId: 'user_loja2',
    name: 'Mundo Pet Express',
    description: 'Preço baixo todo dia e frete grátis acima de R$ 150.',
    address: { street: 'Av. Brigadeiro Luís Antônio', number: '2200', district: 'Jardim Paulista', city: 'São Paulo', state: 'SP', zip: '01402-000', lat: -23.5702, lng: -46.6487 },
    rating: 4.5,
    ratingCount: 870,
    deliveryFee: 0,
    deliveryTimeMin: 35,
    deliveryTimeMax: 55,
    minOrder: 50,
    isOpen: true,
    speciesIds: ['cachorro', 'gato'],
  },
  {
    id: 'store_3',
    ownerId: 'user_loja3',
    name: 'Casa do Gato',
    description: 'Especializada em felinos: rações, areias e arranhadores.',
    address: { street: 'Rua Haddock Lobo', number: '800', district: 'Cerqueira César', city: 'São Paulo', state: 'SP', zip: '01414-001', lat: -23.5633, lng: -46.6668 },
    rating: 4.9,
    ratingCount: 205,
    deliveryFee: 7.5,
    deliveryTimeMin: 30,
    deliveryTimeMax: 45,
    minOrder: 25,
    isOpen: true,
    speciesIds: ['gato'],
  },
  {
    id: 'store_4',
    ownerId: 'user_loja4',
    name: 'Cão & Cia',
    description: 'O melhor para o seu cachorro, do filhote ao sênior.',
    address: { street: 'Rua Vergueiro', number: '3100', district: 'Vila Mariana', city: 'São Paulo', state: 'SP', zip: '04101-300', lat: -23.5839, lng: -46.6385 },
    rating: 4.6,
    ratingCount: 431,
    deliveryFee: 4.99,
    deliveryTimeMin: 40,
    deliveryTimeMax: 60,
    minOrder: 35,
    isOpen: true,
    speciesIds: ['cachorro'],
  },
  {
    id: 'store_5',
    ownerId: 'user_loja5',
    name: 'PetMix Pinheiros',
    description: 'Rações, acessórios e farmácia veterinária.',
    address: { street: 'Rua dos Pinheiros', number: '500', district: 'Pinheiros', city: 'São Paulo', state: 'SP', zip: '05422-001', lat: -23.5658, lng: -46.6839 },
    rating: 4.3,
    ratingCount: 98,
    deliveryFee: 8.9,
    deliveryTimeMin: 45,
    deliveryTimeMax: 70,
    minOrder: 40,
    isOpen: false,
    speciesIds: ['cachorro', 'gato'],
  },
];

/** Fator de preço de cada loja (umas mais caras, outras mais baratas). */
const priceFactor: Record<string, number> = {
  store_1: 1,
  store_2: 0.94,
  store_3: 1.04,
  store_4: 0.98,
  store_5: 1.06,
};

function storeCarries(storeId: string, p: BaseProduct, index: number): boolean {
  switch (storeId) {
    case 'store_3':
      return p.speciesIds.includes('gato');
    case 'store_4':
      return p.speciesIds.includes('cachorro');
    case 'store_2':
      return p.categoryId !== 'remedios';
    case 'store_5':
      return index % 2 === 0;
    default:
      return true;
  }
}

/** Arredonda para terminar em ,90 (ou ,49 nos itens baratos). */
const priceTag = (v: number) => (v < 10 ? Math.round(v * 10) / 10 - 0.01 : Math.floor(v) + 0.9);

export const seedProducts: Product[] = seedStores.flatMap((store, s) =>
  base
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => storeCarries(store.id, p, i))
    .map(({ p, i }) => {
      const price = priceTag(p.price * priceFactor[store.id]);
      const onPromo = (i + s) % 5 === 0;
      return {
        ...p,
        id: `${store.id}__${p.id}`,
        storeId: store.id,
        imageUrls: [],
        price,
        promoPrice: onPromo ? priceTag(price * 0.85) : undefined,
        stock: 5 + ((i * 7 + s * 3) % 40),
        rating: 4 + ((i * 3 + s) % 10) / 10,
        ratingCount: 10 + ((i * 13 + s * 7) % 200),
      };
    }),
);

export const seedReviews: Review[] = [
  {
    id: 'rev_1',
    authorId: 'user_x1',
    authorName: 'Mariana S.',
    storeId: 'store_1',
    productId: 'store_1__nutridog-adulto-mg-15',
    orderId: 'old_1',
    rating: 5,
    comment: 'Meu labrador ama! Chegou em 30 minutos.',
    createdAt: '2026-10-02T15:00:00Z',
  },
  {
    id: 'rev_2',
    authorId: 'user_x2',
    authorName: 'João P.',
    storeId: 'store_1',
    productId: 'store_1__nutridog-adulto-mg-15',
    orderId: 'old_2',
    rating: 4,
    comment: 'Boa ração, pacote bem embalado.',
    createdAt: '2026-09-18T19:30:00Z',
  },
  {
    id: 'rev_3',
    authorId: 'user_x3',
    authorName: 'Fernanda L.',
    storeId: 'store_1',
    orderId: 'old_3',
    rating: 5,
    comment: 'Atendimento excelente, sempre peço aqui.',
    createdAt: '2026-11-01T12:10:00Z',
  },
  {
    id: 'rev_4',
    authorId: 'user_x4',
    authorName: 'Rafael M.',
    storeId: 'store_3',
    productId: 'store_3__felinoplus-castrado-10',
    orderId: 'old_4',
    rating: 5,
    comment: 'Minha gata emagreceu com essa ração. Recomendo!',
    createdAt: '2026-10-21T09:45:00Z',
  },
];
