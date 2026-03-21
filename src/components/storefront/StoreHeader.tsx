import React from 'react';

interface StoreHeaderProps {
  name: string;
  tagline: string;
  logoUrl?: string;
  themeAccentClass?: string;
  layout?: 'minimal' | 'hero' | 'bold' | 'editorial' | 'split';
}

export function StoreHeader({ name, tagline, logoUrl, themeAccentClass, layout = 'hero' }: StoreHeaderProps) {
  
  const Logo = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => logoUrl ? (
    <div className={`overflow-hidden flex items-center justify-center ${className}`} style={style}>
      <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
    </div>
  ) : (
    <div className={`flex items-center justify-center font-bold ${className}`} style={{ backgroundColor: 'var(--accent-color)', color: '#fff', ...style }}>
      <span>{name.charAt(0)}</span>
    </div>
  );

  if (layout === 'minimal') {
    return (
      <header className="text-center mb-24 pt-16">
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-black/5 blur-xl rounded-full scale-150" />
          <Logo className="w-24 h-24 rounded-full mx-auto text-4xl relative z-10 border border-black/5" />
        </div>
        <h1 className="text-5xl sm:text-6xl font-serif tracking-tight mb-8 break-words leading-tight">{name}</h1>
        <div className="w-12 h-[1px] bg-black/20 mx-auto mb-8" />
        <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto break-words leading-relaxed italic">{tagline}</p>
      </header>
    );
  }

  if (layout === 'editorial') {
    return (
      <header className="text-center mb-32 pt-24">
        <Logo className="w-20 h-20 rounded-full mx-auto mb-12 text-3xl border border-black/5" />
        <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-gray-400 mb-8 block">The Collection</span>
        <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tighter mb-12 break-words leading-[0.9]" style={{ fontFamily: 'var(--font-serif)' }}>
          {name.split(' ').map((word, i) => (
            <span key={i} className={i % 2 === 1 ? 'italic font-normal' : ''}>{word} </span>
          ))}
        </h1>
        <div className="flex items-center justify-center gap-6 mb-12">
          <div className="w-16 h-[1px] bg-black/10"></div>
          <div className="w-2 h-2 rounded-full bg-black/20"></div>
          <div className="w-16 h-[1px] bg-black/10"></div>
        </div>
        <p className="text-xl md:text-2xl font-serif italic text-gray-500 max-w-2xl mx-auto break-words leading-relaxed">{tagline}</p>
      </header>
    );
  }

  if (layout === 'bold') {
    return (
      <header className="p-12 sm:p-24 mb-24 text-center relative overflow-hidden rounded-[3rem]" style={{ backgroundColor: 'var(--accent-color)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>
        <Logo className="w-32 h-32 rounded-3xl mx-auto mb-10 text-6xl shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500" />
        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-8 relative z-10 break-words leading-none text-white drop-shadow-2xl">
          {name}
        </h1>
        <p className="text-xl sm:text-2xl font-bold relative z-10 break-words leading-relaxed text-white/90 uppercase tracking-widest">
          {tagline}
        </p>
      </header>
    );
  }

  if (layout === 'split') {
    return (
      <header className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 pt-12 items-center">
        <div className="order-2 lg:order-1">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6 block">Featured Store</span>
          <h1 className="text-5xl sm:text-7xl font-serif tracking-tight mb-8 break-words leading-[1.1]">{name}</h1>
          <p className="text-xl text-gray-500 font-light leading-relaxed mb-10 italic font-serif">{tagline}</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-[1px] bg-black" />
            <span className="text-xs font-bold uppercase tracking-widest">Explore Below</span>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="aspect-square rounded-[3rem] overflow-hidden relative group">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
              alt={name} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
            <div className="absolute top-10 right-10">
              <Logo className="w-24 h-24 rounded-full text-4xl shadow-2xl backdrop-blur-md border border-white/20" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Default: hero
  return (
    <header className="relative w-full overflow-hidden rounded-[2rem] sm:rounded-[3rem] mb-24 sm:mb-32 flex items-center justify-center min-h-[50vh] sm:min-h-[65vh] group" style={{ backgroundColor: 'var(--accent-color)' }}>
      {/* Background Image/Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
          alt="Store Hero" 
          className="w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 text-center px-8 py-24 max-w-5xl mx-auto flex flex-col items-center">
        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <Logo className="w-28 h-28 sm:w-40 sm:h-40 rounded-full border border-white/30 shadow-2xl backdrop-blur-xl text-white text-4xl sm:text-6xl relative z-10" />
        </div>
        
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] font-bold text-white/70 mb-6 drop-shadow-md">Welcome to our space</span>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif tracking-tight text-white mb-10 drop-shadow-2xl break-words leading-[0.95]" style={{ fontFamily: 'var(--font-serif)' }}>
          {name}
        </h1>
        
        <div className="w-20 h-[1px] bg-white/30 mb-10" />
        
        <p className="text-xl sm:text-2xl md:text-3xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light italic drop-shadow-xl break-words font-serif">
          {tagline}
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
        <div className="flex flex-col gap-2">
          <div className="w-12 h-[1px] bg-white/20" />
          <div className="w-8 h-[1px] bg-white/20" />
          <div className="w-4 h-[1px] bg-white/20" />
        </div>
      </div>
      <div className="absolute top-10 right-10 hidden lg:block">
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold rotate-90 origin-right">Est. {new Date().getFullYear()}</span>
      </div>
    </header>
  );
}
