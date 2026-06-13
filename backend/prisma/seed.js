import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  { name: "Wireless Bluetooth Headphones", slug: "wireless-bluetooth-headphones", description: "Premium noise-cancelling wireless headphones with 30-hour battery life, deep bass, and comfortable over-ear design. Features Bluetooth 5.3, multipoint connection, and a foldable design for travel.", originalPrice: 149.99, salePrice: 129.99, stock: 50, images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"], category: "Electronics", rating: 4.5 },
  { name: "Minimalist Leather Watch", slug: "minimalist-leather-watch", description: "Elegant analog watch with genuine leather strap, sapphire crystal glass, and Japanese quartz movement.", originalPrice: 89.99, salePrice: null, stock: 30, images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80"], category: "Accessories", rating: 4.3 },
  { name: "Organic Cotton T-Shirt", slug: "organic-cotton-tshirt", description: "Soft, breathable organic cotton t-shirt with a relaxed fit. Pre-shrunk fabric, reinforced seams.", originalPrice: 34.99, salePrice: 24.99, stock: 100, images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80"], category: "Clothing", rating: 4.7 },
  { name: "Smart Water Bottle", slug: "smart-water-bottle", description: "Temperature-displaying vacuum-insulated bottle with hydration reminder LED.", originalPrice: 45.00, salePrice: null, stock: 75, images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80"], category: "Lifestyle", rating: 4.1 },
  { name: "Mechanical Keyboard", slug: "mechanical-keyboard", description: "Hot-swappable mechanical keyboard with Cherry MX switches, per-key RGB lighting, and a compact 75% layout.", originalPrice: 129.99, salePrice: 109.99, stock: 40, images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"], category: "Electronics", rating: 4.6 },
  { name: "Canvas Backpack", slug: "canvas-backpack", description: "Vintage-style waxed canvas backpack with padded laptop compartment (fits 15\"), multiple organizer pockets.", originalPrice: 79.99, salePrice: null, stock: 60, images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"], category: "Accessories", rating: 4.4 },
  { name: "Wireless Charging Pad", slug: "wireless-charging-pad", description: "15W fast wireless charger compatible with iPhone and Android. Slim aluminum design.", originalPrice: 24.99, salePrice: 19.99, stock: 200, images: ["https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=600&q=80"], category: "Electronics", rating: 4.2 },
  { name: "Wool Blend Sweater", slug: "wool-blend-sweater", description: "Cozy wool-cashmere blend sweater with ribbed cuffs and hem. Machine washable.", originalPrice: 69.99, salePrice: null, stock: 45, images: ["https://images.unsplash.com/photo-1434389677669-e08b4cda3a4b?w=600&q=80"], category: "Clothing", rating: 4.5 },
  { name: "Ceramic Coffee Mug Set", slug: "ceramic-coffee-mug-set", description: "Handcrafted set of 4 ceramic mugs with minimalist glaze finish.", originalPrice: 39.99, salePrice: null, stock: 80, images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80"], category: "Lifestyle", rating: 4.8 },
  { name: "Portable Bluetooth Speaker", slug: "portable-bluetooth-speaker", description: "Rugged IP67 waterproof speaker with 20W output and 360-degree sound.", originalPrice: 59.99, salePrice: 49.99, stock: 0, images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80"], category: "Electronics", rating: 4.3 },
  { name: "Denim Jacket", slug: "denim-jacket", description: "Classic denim jacket in medium wash. Button front and two chest pockets.", originalPrice: 89.99, salePrice: 74.99, stock: 35, images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80"], category: "Clothing", rating: 4.6 },
  { name: "Stainless Steel Tumbler", slug: "stainless-steel-tumbler", description: "Double-wall vacuum insulated tumbler with spill-resistant lid.", originalPrice: 29.99, salePrice: null, stock: 150, images: ["https://images.unsplash.com/photo-1607936854279-b55f8d91c4f6?w=600&q=80"], category: "Lifestyle", rating: 4.4 },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
