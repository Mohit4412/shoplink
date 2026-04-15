import { Product } from '../../types';
import { CopyLinkButton } from './CopyLinkButton';

interface ProductTableProps {
  products: Product[];
  filteredProducts: Product[];
  currencySymbol: string;
  username: string;
  onManageCollection: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({
  products,
  filteredProducts,
  currencySymbol,
  username,
  onManageCollection,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const getProductCollections = (product: Product) => product.collections?.length
    ? product.collections
    : product.collection
      ? [product.collection]
      : [];

  return (
    <>
      <div className="space-y-3 md:hidden">
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border bg-[var(--app-panel)] px-4 py-10 text-center text-sm text-[var(--app-text-muted)]" style={{ borderColor: 'var(--app-border)' }}>
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const productCollections = getProductCollections(product);
            return (
              <div key={product.id} className="overflow-hidden rounded-2xl border bg-[var(--app-panel)]" style={{ borderColor: 'var(--app-border)' }}>
                {/* Top: image + info */}
                <div className="flex items-stretch gap-0">
                  {/* Image panel */}
                  <div className="my-3 ml-3 flex w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--app-panel-muted)]">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Info panel */}
                  <div className="flex min-w-0 flex-1 flex-col justify-start gap-1 px-3 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--app-text)]">{product.name}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 border ${
                        product.status === 'Active' ? 'bg-[#e8f2eb] border-[#c5d8c8] text-emerald-700' : 'bg-[var(--app-panel-muted)] text-[var(--app-text-muted)]'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--app-text)]">{currencySymbol}{product.price.toFixed(2)}</p>
                    <div className="flex flex-wrap items-center gap-1">
                      {productCollections.length > 0 ? (
                        productCollections.slice(0, 2).map((collection) => (
                          <span key={collection} className="inline-flex items-center rounded-md bg-[var(--app-panel-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--app-text-muted)]">
                            {collection}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center rounded-md border bg-[var(--app-panel-muted)] px-2 py-0.5 text-[10px] font-medium text-zinc-400" style={{ borderColor: 'var(--app-border)' }}>
                          No collection
                        </span>
                      )}
                      {productCollections.length > 2 && (
                        <span className="text-[10px] font-medium text-zinc-400">+{productCollections.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Bottom: actions */}
                <div className="flex items-center gap-0 border-t" style={{ borderColor: 'var(--app-border)' }}>
                  <button
                    type="button"
                    onClick={() => onManageCollection(product)}
                    className="flex-1 border-r py-2 text-[11px] font-semibold text-[#2f855a] transition-colors hover:bg-[var(--app-panel-muted)]"
                    style={{ borderColor: 'var(--app-border)' }}
                  >
                    {productCollections.length > 0 ? 'Collections' : 'Assign'}
                  </button>
                  <CopyLinkButton username={username} productId={product.id} variant="full" />
                  <button
                    onClick={() => onEdit(product)}
                    className="flex-1 border-r py-2 text-[11px] font-semibold text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-panel-muted)]"
                    style={{ borderColor: 'var(--app-border)' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="flex-1 py-2 text-[11px] font-semibold text-red-500 transition-colors hover:bg-[#f8eceb]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table
        className="min-w-[520px] w-full overflow-hidden rounded-2xl border bg-[var(--app-panel)] text-left text-sm"
        style={{ borderColor: 'var(--app-border)' }}
      >
        <thead className="border-b bg-[var(--app-panel-muted)] text-[10px] uppercase text-zinc-400" style={{ borderColor: 'var(--app-border)' }}>
          <tr>
            <th className="w-[56px] px-3 py-2.5 font-semibold"></th>
            <th className="min-w-[140px] px-3 py-2.5 font-semibold">Product</th>
            <th className="min-w-[80px] px-3 py-2.5 font-semibold">Price</th>
            <th className="min-w-[100px] px-3 py-2.5 font-semibold">Collection</th>
            <th className="min-w-[80px] px-3 py-2.5 font-semibold">Status</th>
            <th className="min-w-[80px] px-3 py-2.5 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--app-text-muted)]">
                No products found.
              </td>
            </tr>
          ) : (
            filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="h-14 border-b transition-colors hover:bg-[var(--app-panel-muted)] last:border-b-0"
                style={{ borderColor: '#ece9e4' }}
              >
                <td className="px-3 py-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--app-panel-muted)]">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-[var(--app-text)]">{product.name}</td>
                <td className="px-3 py-2 text-[13px] text-[var(--app-text-muted)]">{currencySymbol}{product.price.toFixed(2)}</td>
                <td className="px-3 py-2 text-[13px]">
                  {(() => {
                    const productCollections = getProductCollections(product);
                    return (
                  <div className="flex items-center gap-2">
                    {productCollections.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {productCollections.slice(0, 2).map((collection) => (
                          <span key={collection} className="inline-flex items-center rounded-md bg-[var(--app-panel-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--app-text-muted)]">
                            {collection}
                          </span>
                        ))}
                        {productCollections.length > 2 && (
                          <span className="inline-flex items-center rounded-md bg-[var(--app-panel-muted)] px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                            +{productCollections.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-[var(--app-panel-muted)] px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                        Unassigned
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onManageCollection(product)}
                      className="text-[11px] font-semibold text-[#2f855a] hover:text-[#276749]"
                    >
                      {productCollections.length > 0 ? 'Manage' : 'Assign'}
                    </button>
                  </div>
                    );
                  })()}
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                    product.status === 'Active' ? 'bg-[#e8f2eb] border-[#c5d8c8] text-emerald-700' : 'bg-[var(--app-panel-muted)] text-[var(--app-text-muted)]'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <CopyLinkButton username={username} productId={product.id} variant="icon" />
                  <button onClick={() => onEdit(product)} className="ml-2.5 mr-2.5 text-[11px] font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)]">Edit</button>
                  <button onClick={() => onDelete(product)} className="text-[11px] font-semibold text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      <p className="mt-2 px-1 text-[11px] text-zinc-400">
        {filteredProducts.length} of {products.length} products
      </p>
    </>
  );
}
