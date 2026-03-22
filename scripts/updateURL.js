const fs = require('fs');

// Fix Dashboard.tsx
let dash = fs.readFileSync('src/screens/Dashboard.tsx', 'utf8');
dash = dash.replace(/React\.useEffect\(\(\) => \{\n\s+setOrigin\(window\.location\.origin\);\n\s+\}, \[\]\);/g, '');
dash = dash.replace(/const storeUrl = user\?\.username && origin \? `\$\{origin\}\/\$\{user\.username\}` : '';/g, 'const storeUrl = user?.username ? `https://${user.username}.myshoplink.site` : ``;');
dash = dash.replace(/<ShareModal \n\s+isOpen=\{isShareModalOpen\}\n\s+onClose=\{() => setIsShareModalOpen\(false\)\}\n\s+storeUrl=\{storeUrl\}\n\s+\/>/g, '<ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} username={user?.username || ``} />');
fs.writeFileSync('src/screens/Dashboard.tsx', dash);

// Update StoreFront.tsx buildWhatsAppUrl
let sf = fs.readFileSync('src/screens/StoreFront.tsx', 'utf8');
const pUrlImport = `import { getProductUrl } from '../utils/storeUrl';\n`;
if(!sf.includes('getProductUrl')) sf = pUrlImport + sf;

sf = sf.replace(
  /const message = product\n\s+\? `Hi! I want to order: \*\$\{product\.name\}\* — \$\{currencySymbol\}\$\{product\.price\.toFixed\(2\)\}\. Please confirm availability\. \🙏`\n\s+: `Hi \$\{store\.name\}, I'm interested in exploring your store\.`;/g,
  `const productLink = product ? getProductUrl(resolvedStoreId, product.id) : '';
    const message = product
      ? \`Hi! I want to order: *\${product.name}* — \${currencySymbol}\${product.price.toFixed(2)}.\\n\\n\${productLink}\\n\\nPlease confirm availability. 🙏\`
      : \`Hi \${store.name}, I'm interested in exploring your store.\`;`
);
fs.writeFileSync('src/screens/StoreFront.tsx', sf);
