import Database from 'better-sqlite3';

function run() {
  const db = new Database('./server/shoplink.db');
  
  const storesWithoutProducts = db.prepare(`SELECT username FROM stores WHERE username NOT IN (SELECT store_username FROM products)`).all();
  
  console.log(`Found ${storesWithoutProducts.length} stores without products.`);
  
  const insertStmt = db.prepare(`
    INSERT INTO products (
      store_username, product_id, image_url, images_json, name, price, description, status, created_at,
      category, stock, collection_name, highlights_json, reviews_json
    ) VALUES (
      @store_username, @product_id, @image_url, @images_json, @name, @price, @description, @status, @created_at,
      @category, @stock, @collection_name, @highlights_json, @reviews_json
    )
  `);

  const demoProductsTemplate = [
    {
      id: 'p1',
      name: 'Minimalist White Sneakers',
      price: 85.0,
      description: 'Clean, versatile, and crafted from premium vegan leather...',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2224&auto=format&fit=crop',
      category: 'Footwear',
      stock: 45,
    },
    {
      id: 'p2',
      name: 'Textured Knit Sweater',
      price: 120.0,
      description: 'A cozy, heavy-gauge knit sweater made from a soft merino wool blend.',
      imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2872&auto=format&fit=crop',
      category: 'Apparel',
      stock: 20,
    },
    {
      id: 'p3',
      name: 'Matte Black Chronograph',
      price: 195.0,
      description: 'Sleek, stealthy, and functional.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2899&auto=format&fit=crop',
      category: 'Accessories',
      stock: 8,
    },
    {
      id: 'p4',
      name: 'Classic Aviator Sunglasses',
      price: 65.0,
      description: 'Timeless aviator design with gold-tone frames.',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2960&auto=format&fit=crop',
      category: 'Accessories',
      stock: 30,
    }
  ];

  db.transaction(() => {
    for (const store of storesWithoutProducts) {
      for (const p of demoProductsTemplate) {
        insertStmt.run({
          store_username: store.username,
          product_id: `demo-${p.id}-${Date.now()}`,
          image_url: p.imageUrl,
          images_json: JSON.stringify([p.imageUrl]),
          name: p.name,
          price: p.price,
          description: p.description,
          status: 'Active',
          created_at: new Date().toISOString(),
          category: p.category,
          stock: p.stock,
          collection_name: null,
          highlights_json: JSON.stringify([]),
          reviews_json: JSON.stringify([])
        });
      }
    }
  })();
  
  console.log('Successfully seeded demo products to all existing users without products.');
}

run();
