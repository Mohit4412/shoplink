import React from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product, CartItem } from '../../types';

interface ProductGridProps {
  products: Product[];
  currencySymbol: string;
  themeCardClass: string;
  themeAccentClass: string;
  themeImageBgClass: string;
  themeTextMutedClass: string;
  cartItems: CartItem[];
  layout?: 'standard' | 'large' | 'brutalist' | 'horizontal' | 'editorial';
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export function ProductGrid({ 
  products, 
  currencySymbol, 
  themeCardClass, 
  themeAccentClass, 
  themeImageBgClass,
  themeTextMutedClass,
  cartItems,
  layout = 'standard',
  onAddToCart,
  onUpdateQuantity
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-32 opacity-60">
        <p className="text-xl font-light">No products available at the moment.</p>
      </div>
    );
  }

  const gridCols = layout === 'large' 
    ? 'grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20' 
    : layout === 'horizontal'
    ? 'grid-cols-1 lg:grid-cols-2 gap-6'
    : layout === 'editorial'
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16';

  const alignText = layout === 'large' || layout === 'editorial' ? 'items-center text-center' : 'items-start text-left';
  const imageAspect = layout === 'large' || layout === 'editorial' ? 'aspect-[4/5]' : 'aspect-[3/4]';
  const roundedClass = layout === 'brutalist' ? 'rounded-none' : layout === 'editorial' ? 'rounded-3xl' : 'rounded-2xl';
  const isHorizontal = layout === 'horizontal';
  const isEditorial = layout === 'editorial';

  return (
    <div className={`grid ${gridCols}`}>
      {products.map((product) => {
        const cartItem = cartItems.find(item => item.product.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;

        return (
          <div 
            key={product.id} 
            className={`group relative flex ${isHorizontal ? 'flex-row gap-4 sm:gap-6 p-3 sm:p-4' : 'flex-col'} ${themeCardClass} ${roundedClass} ${isEditorial ? 'p-4 sm:p-6' : ''}`}
          >
            {/* Image Container */}
            <div className={`${isHorizontal ? 'w-28 sm:w-40 aspect-[4/5] sm:aspect-square shrink-0 mb-0' : `${imageAspect} w-full mb-8`} relative ${themeImageBgClass} ${roundedClass} overflow-hidden`}>
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Desktop Hover Action */}
              {!isHorizontal && (
                <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hidden sm:block">
                  {quantity > 0 ? (
                    <div className="flex items-center justify-between bg-white/95 backdrop-blur-xl text-black px-6 py-4 rounded-2xl shadow-2xl border border-black/5">
                      <button 
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="font-bold text-sm uppercase tracking-widest">{quantity} in cart</span>
                      <button 
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="w-full bg-white/95 backdrop-blur-xl text-black py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-white transition-all duration-300 flex items-center justify-center border border-black/5"
                      style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-3" />
                      Add to Bag
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className={`flex flex-col flex-1 ${isHorizontal ? 'py-1 justify-center' : 'px-2'} ${alignText}`}>
              {layout === 'large' || layout === 'editorial' ? (
                <>
                  <h3 className={`text-2xl sm:text-3xl font-serif tracking-tight mb-3 ${isEditorial ? 'italic' : ''}`}>{product.name}</h3>
                  <p className={`text-sm sm:text-base ${themeTextMutedClass} line-clamp-2 leading-relaxed font-light mb-6 max-w-md mx-auto`}>{product.description}</p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] w-8 bg-black/10" />
                    <span className="text-xl font-medium tracking-tight">{currencySymbol}{product.price.toFixed(2)}</span>
                    <div className="h-[1px] w-8 bg-black/10" />
                  </div>
                </>
              ) : isHorizontal ? (
                <>
                  <div className="flex justify-between items-start w-full mb-1 sm:mb-2">
                    <h3 className="text-base sm:text-lg font-medium tracking-tight line-clamp-2 pr-2">{product.name}</h3>
                    <span className="text-base sm:text-lg font-semibold whitespace-nowrap">{currencySymbol}{product.price.toFixed(2)}</span>
                  </div>
                  <p className={`text-xs sm:text-sm ${themeTextMutedClass} line-clamp-2 leading-relaxed font-light mb-3 sm:mb-4`}>{product.description}</p>
                  
                  <div className="mt-auto">
                    {quantity > 0 ? (
                      <div className={`flex items-center justify-between border rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 w-full sm:w-auto sm:inline-flex sm:gap-4 border-black/10`}>
                        <button onClick={() => onUpdateQuantity(product.id, -1)} className="p-1">
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="font-medium text-sm sm:text-base">{quantity}</span>
                        <button onClick={() => onUpdateQuantity(product.id, 1)} className="p-1">
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddToCart(product)}
                        className={`w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors ${themeAccentClass}`}
                        style={{ backgroundColor: 'var(--accent-color)' }}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start w-full mb-2">
                    <h3 className="text-lg font-medium tracking-tight line-clamp-1 pr-4">{product.name}</h3>
                    <span className="text-lg font-semibold whitespace-nowrap">{currencySymbol}{product.price.toFixed(2)}</span>
                  </div>
                  <p className={`text-sm ${themeTextMutedClass} line-clamp-2 leading-relaxed font-light mb-4`}>{product.description}</p>
                </>
              )}
              
              {/* Mobile Action (Visible only on small screens for non-horizontal) */}
              {!isHorizontal && (
                <div className={`mt-auto sm:hidden w-full ${layout === 'large' ? 'flex justify-center' : ''}`}>
                  {quantity > 0 ? (
                    <div className={`flex items-center justify-between border rounded-xl px-4 py-2.5 w-full border-black/10`}>
                      <button onClick={() => onUpdateQuantity(product.id, -1)} className="p-1">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium">{quantity}</span>
                      <button onClick={() => onUpdateQuantity(product.id, 1)} className="p-1">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAddToCart(product)}
                      className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${themeAccentClass}`}
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
