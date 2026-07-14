/**
 * Seeds the database with:
 *  - one admin login (so you can access /admin immediately)
 *  - a full authentic Ethiopian menu (27 dishes across 8 categories)
 *
 * Run with: npm run db:seed
 * (If you just changed prisma/schema.prisma, run `npm run db:push` FIRST
 * so the new `category`/`isVegetarian`/`isSpicy` columns exist.)
 *
 * IMPORTANT — Amharic spelling accuracy:
 * The nameAm (Amharic) field is filled in for dishes I'm confident about,
 * and left as `null` for several regional/specialty dishes (Borasaame,
 * Tihlo, Gored Gored, Kik Alicha, Azifa, Maheberawi, Kinche, Dereq Tibs)
 * where I don't have a verified standard spelling. Please have a native
 * speaker review every nameAm value below before this goes live — getting
 * this wrong is worse than leaving it blank, especially for a menu meant
 * to represent the cuisine authentically.
 *
 * Prices are realistic estimates for a mid-range Addis Ababa-style
 * restaurant, in ETB — adjust to your actual costs/market before launch.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const MENU: Array<{
  nameEn: string;
  nameAm: string | null;
  emoji: string;
  description: string;
  price: number;
  category:
    | 'FOUNDATION'
    | 'BREAKFAST'
    | 'TIBS'
    | 'WOT'
    | 'RAW_MEAT'
    | 'VEGAN_FASTING'
    | 'COMBOS_REGIONAL'
    | 'APPS_SIDES';
  isVegetarian: boolean;
  isSpicy: boolean;
  sortOrder: number;
}> = [
  // 1. THE FOUNDATION
  {
    nameEn: 'Injera',
    nameAm: 'እንጀራ',
    emoji: '🫓',
    description: 'Spongy sourdough teff flatbread — the base for nearly every dish on this menu.',
    price: 60,
    category: 'FOUNDATION',
    isVegetarian: true,
    isSpicy: false,
    sortOrder: 1
  },

  // 2. BREAKFAST
  {
    nameEn: 'Chechebsa (Kitcha Fit-fit)',
    nameAm: 'ጨጨብሳ',
    emoji: '🥞',
    description: 'Shredded flatbread fried with niter kibbeh and berbere, often served with honey or yogurt.',
    price: 150,
    category: 'BREAKFAST',
    isVegetarian: true,
    isSpicy: true,
    sortOrder: 1
  },
  {
    nameEn: 'Firfir (Quanta Firfir)',
    nameAm: 'ፍርፍር',
    emoji: '🌶️',
    description: 'Shredded injera marinated in a spicy berbere-butter sauce; the Quanta version adds beef jerky.',
    price: 180,
    category: 'BREAKFAST',
    isVegetarian: false,
    isSpicy: true,
    sortOrder: 2
  },
  {
    nameEn: 'Genfo',
    nameAm: 'ገንፎ',
    emoji: '🍲',
    description: 'Dense barley porridge served with a crater of melted spiced butter and berbere at the center.',
    price: 130,
    category: 'BREAKFAST',
    isVegetarian: true,
    isSpicy: true,
    sortOrder: 3
  },
  {
    nameEn: 'Enqulal Firfir',
    nameAm: 'እንቁላል ፍርፍር',
    emoji: '🍳',
    description: 'Ethiopian-style scrambled eggs with spiced butter, onions, tomatoes, and chilies.',
    price: 160,
    category: 'BREAKFAST',
    isVegetarian: true,
    isSpicy: true,
    sortOrder: 4
  },
  {
    nameEn: 'Fatira',
    nameAm: 'ፋቲራ',
    emoji: '🥮',
    description: 'Thin, flaky pastry with scrambled eggs and honey.',
    price: 140,
    category: 'BREAKFAST',
    isVegetarian: true,
    isSpicy: false,
    sortOrder: 5
  },
  {
    nameEn: 'Kinche',
    nameAm: null,
    emoji: '🌾',
    description: 'Cracked wheat boiled tender and dressed in niter kibbeh (spiced clarified butter).',
    price: 120,
    category: 'BREAKFAST',
    isVegetarian: true,
    isSpicy: false,
    sortOrder: 6
  },

  // 3. SAUTÉED MEATS (TIBS)
  {
    nameEn: 'Shekla Tibs',
    nameAm: 'ሸክላ ጥብስ',
    emoji: '🍖',
    description:
      'Sautéed beef, lamb, or goat with onions, garlic, rosemary, and jalapeños, served sizzling in a clay pot.',
    price: 450,
    category: 'TIBS',
    isVegetarian: false,
    isSpicy: true,
    sortOrder: 1
  },
  {
    nameEn: 'Dereq Tibs',
    nameAm: null,
    emoji: '🔥',
    description: 'Deeply charred, crispy pan-fried "dry" tibs — cooked without sauce for maximum sear.',
    price: 420,
    category: 'TIBS',
    isVegetarian: false,
    isSpicy: false,
    sortOrder: 2
  },
  {
    nameEn: 'Awaze Tibs',
    nameAm: 'አዋዜ ጥብስ',
    emoji: '🌶️',
    description: 'Sautéed meat tossed directly in a rich, berbere-infused awaze pepper paste.',
    price: 480,
    category: 'TIBS',
    isVegetarian: false,
    isSpicy: true,
    sortOrder: 3
  },

  // 4. STEWS (WOT)
  {
    nameEn: 'Doro Wat',
    nameAm: 'ዶሮ ወጥ',
    emoji: '🍗',
    description: "Slow-cooked, deeply spicy chicken stew with hard-boiled eggs — Ethiopia's national dish.",
    price: 550,
    category: 'WOT',
    isVegetarian: false,
    isSpicy: true,
    sortOrder: 1
  },
  {
    nameEn: 'Siga Wat (Key Wat)',
    nameAm: 'ስጋ ወጥ',
    emoji: '🥘',
    description: 'Spicy, thick beef or lamb stew in a rich red berbere sauce.',
    price: 500,
    category: 'WOT',
    isVegetarian: false,
    isSpicy: true,
    sortOrder: 2
  },
  {
    nameEn: 'Alicha Wat',
    nameAm: 'አልጫ ወጥ',
    emoji: '🥔',
    description: 'A gentle, non-spicy beef, lamb, and potato stew cooked with turmeric, garlic, and ginger.',
    price: 420,
    category: 'WOT',
    isVegetarian: false,
    isSpicy: false,
    sortOrder: 3
  },

  // 5. RAW MEAT DELICACIES
  {
    nameEn: 'Kitfo',
    nameAm: 'ክትፎ',
    emoji: '🥩',
    description:
      'Finely minced premium lean beef marinated in mitmita and warmed spiced butter — served raw, medium, or well-done.',
    price: 650,
    category: 'RAW_MEAT',
    isVegetarian: false,
    isSpicy: true,
    sortOrder: 1
  },
  {
    nameEn: 'Gored Gored',
    nameAm: null,
    emoji: '🥩',
    description: 'Cubes of raw beef tossed in warm spiced butter and hot awaze paste.',
    price: 680,
    category: 'RAW_MEAT',
    isVegetarian: false,
    isSpicy: true,
    sortOrder: 2
  },

  // 6. VEGAN & FASTING STAPLES (YETSOM)
  {
    nameEn: 'Shiro Wat',
    nameAm: 'ሽሮ ወጥ',
    emoji: '🫘',
    description: 'A smooth, thick chickpea flour purée cooked with garlic and onions.',
    price: 250,
    category: 'VEGAN_FASTING',
    isVegetarian: true,
    isSpicy: false,
    sortOrder: 1
  },
  {
    nameEn: 'Misir Wat',
    nameAm: 'ምስር ወጥ',
    emoji: '🍛',
    description: 'Split red lentils slow-cooked in a spicy berbere sauce.',
    price: 260,
    category: 'VEGAN_FASTING',
    isVegetarian: true,
    isSpicy: true,
    sortOrder: 2
  },
  {
    nameEn: 'Kik Alicha',
    nameAm: null,
    emoji: '🟡',
    description: 'Mild yellow split peas cooked with turmeric and ginger.',
    price: 240,
    category: 'VEGAN_FASTING',
    isVegetarian: true,
    isSpicy: false,
    sortOrder: 3
  },
  {
    nameEn: 'Gomen',
    nameAm: 'ጎመን',
    emoji: '🥬',
    description: 'Earthy collard greens, slow-simmered with garlic and onions.',
    price: 220,
    category: 'VEGAN_FASTING',
    isVegetarian: true,
    isSpicy: false,
    sortOrder: 4
  },
  {
    nameEn: 'Atkilt Wat (Fossolia)',
    nameAm: 'አትክልት ወጥ',
    emoji: '🥕',
    description: 'A vibrant stir-fry of cabbage, carrots, potatoes, and string beans.',
    price: 230,
    category: 'VEGAN_FASTING',
    isVegetarian: true,
    isSpicy: false,
    sortOrder: 5
  },
  {
    nameEn: 'Azifa',
    nameAm: null,
    emoji: '🥗',
    description: 'A cold lentil salad tossed with minced onions, green chilies, and a mustard-lemon dressing.',
    price: 200,
    category: 'VEGAN_FASTING',
    isVegetarian: true,
    isSpicy: true,
    sortOrder: 6
  },

  // 7. COMBOS & REGIONAL SPECIALTIES
  {
    nameEn: 'Yetsom Beyaynetu',
    nameAm: 'የፆም በያይነቱ',
    emoji: '🌈',
    description: 'The classic colorful vegan sampler platter, served on fresh injera.',
    price: 380,
    category: 'COMBOS_REGIONAL',
    isVegetarian: true,
    isSpicy: false,
    sortOrder: 1
  },
  {
    nameEn: 'Maheberawi',
    nameAm: null,
    emoji: '🍽️',
    description: 'The ultimate meat-lovers platter, combining various meat stews, tibs, and kitfo.',
    price: 850,
    category: 'COMBOS_REGIONAL',
    isVegetarian: false,
    isSpicy: true,
    sortOrder: 2
  },
  {
    nameEn: 'Borasaame',
    nameAm: null,
    emoji: '🫓',
    description: 'A Sidama specialty made of fermented enset (false banana) root pulp mixed with rich butter.',
    price: 300,
    category: 'COMBOS_REGIONAL',
    isVegetarian: true,
    isSpicy: false,
    sortOrder: 3
  },
  {
    nameEn: 'Tihlo',
    nameAm: null,
    emoji: '🍡',
    description: 'A Tigray specialty of roasted barley flour dough spheres, dipped into a spicy meat sauce.',
    price: 320,
    category: 'COMBOS_REGIONAL',
    isVegetarian: false,
    isSpicy: true,
    sortOrder: 4
  },

  // 8. APPS & SIDES
  {
    nameEn: 'Sambusa',
    nameAm: 'ሳምቡሳ',
    emoji: '🥟',
    description: 'Crispy fried pastry triangles stuffed with spiced minced beef or lentils.',
    price: 90,
    category: 'APPS_SIDES',
    isVegetarian: false,
    isSpicy: false,
    sortOrder: 1
  },
  {
    nameEn: 'Ayibe',
    nameAm: 'አይብ',
    emoji: '🧀',
    description: 'Mild, crumbly homemade cottage cheese, served to cool down spicier dishes.',
    price: 100,
    category: 'APPS_SIDES',
    isVegetarian: true,
    isSpicy: false,
    sortOrder: 2
  }
];

async function main() {
  const passwordHash = await bcrypt.hash('changeme123', 12);

  await prisma.adminUser.upsert({
    where: { email: 'admin@habeshabistro.com' },
    update: {},
    create: {
      name: 'Restaurant Admin',
      email: 'admin@habeshabistro.com',
      passwordHash,
      role: 'MANAGER'
    }
  });
  console.log('✓ Admin user ready → admin@habeshabistro.com / changeme123 (change this password later)');

  const existing = await prisma.menuItem.count();
  if (existing > 0) {
    console.log(`✓ Menu already has ${existing} item(s) — skipping to avoid duplicates.`);
    console.log('  To replace the menu entirely, delete existing MenuItem rows first (Prisma Studio is easiest).');
  } else {
    await prisma.menuItem.createMany({ data: MENU });
    console.log(`✓ Seeded ${MENU.length} menu items across 8 categories.`);
    const missingAmharic = MENU.filter((m) => !m.nameAm).map((m) => m.nameEn);
    if (missingAmharic.length > 0) {
      console.log(
        `⚠ ${missingAmharic.length} item(s) have no Amharic name yet — add via /admin once verified: ${missingAmharic.join(', ')}`
      );
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
