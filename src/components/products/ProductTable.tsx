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
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const productCollections = getProductCollections(product);
            return (
              <div key={product.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                {/* Top: image + info */}
                <div className="flex items-stretch gap-0">
                  {/* Image panel */}
                  <div className="w-24 shrink-0 bg-gray-50 flex items-center justify-center ml-3 my-3 rounded-xl overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Info panel */}
                  <div className="flex-1 min-w-0 px-3.5 py-3 flex flex-col justify-start gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{product.name}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                        product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="text-base font-bold text-gray-800">{currencySymbol}{product.price.toFixed(2)}</p>
                    <div className="flex flex-wrap items-center gap-1">
                      {productCollections.length > 0 ? (
                        productCollections.slice(0, 2).map((collection) => (
                          <span key={collection} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                            {collection}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-400">
                          No collection
                        </span>
                      )}
                      {productCollections.length > 2 && (
                        <span className="text-[11px] font-medium text-gray-400">+{productCollections.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Bottom: actions */}
                <div className="flex items-center gap-0 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => onManageCollection(product)}
                    className="flex-1 py-2.5 text-xs font-semibold text-[#059669] hover:bg-gray-50 transition-colors border-r border-gray-100"
                  >
                    {productCollections.length > 0 ? 'Collections' : 'Assign'}
                  </button>
                  <CopyLinkButton username={username} productId={product.id} variant="full" />
                  <button
                    onClick={() => onEdit(product)}
                    className="flex-1 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="flex-1 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden overflow-x-auto -mx-4 px-4 md:block">
      <table className="min-w-[520px] w-full text-sm text-left bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-3 py-3 font-semibold w-[64px]"></th>
            <th className="px-3 py-3 font-semibold min-w-[140px]">Product</th>
            <th className="px-3 py-3 font-semibold min-w-[80px]">Price</th>
            <th className="px-3 py-3 font-semibold min-w-[100px]">Collection</th>
            <th className="px-3 py-3 font-semibold min-w-[80px]">Status</th>
            <th className="px-3 py-3 font-semibold min-w-[80px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                No products found.
              </td>
            </tr>
          ) : (
            filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors h-16">
                <td className="px-3 py-2">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </td>
                <td className="px-3 py-2 font-medium text-gray-900 text-sm">{product.name}</td>
                <td className="px-3 py-2 text-sm text-gray-600">{currencySymbol}{product.price.toFixed(2)}</td>
                <td className="px-3 py-2 text-sm">
                  {(() => {
                    const productCollections = getProductCollections(product);
                    return (
                  <div className="flex items-center gap-2">
                    {productCollections.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1">
                        {productCollections.slice(0, 2).map((collection) => (
                          <span key={collection} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {collection}
                          </span>
                        ))}
                        {productCollections.length > 2 && (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-500">
                            +{productCollections.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400">
                        Unassigned
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onManageCollection(product)}
                      className="text-xs font-semibold text-[#059669] hover:text-[#047857]"
                    >
                      {productCollections.length > 0 ? 'Manage' : 'Assign'}
                    </button>
                  </div>
                    );
                  })()}
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <CopyLinkButton username={username} productId={product.id} variant="icon" />
                  <button onClick={() => onEdit(product)} className="text-xs font-semibold text-gray-600 hover:text-gray-900 ml-3 mr-3">Edit</button>
                  <button onClick={() => onDelete(product)} className="text-xs font-semibold text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      <p className="text-xs text-gray-400 mt-2 px-1">
        {filteredProducts.length} of {products.length} products
      </p>
    </>
  );
}
