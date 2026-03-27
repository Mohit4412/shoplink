import { useState } from 'react';
import { StoreSettings, LegalPages } from '../../types';
import { Theme } from '../../utils/themes';
import { Modal } from '../ui/Modal';

interface StoreFooterProps {
  store: StoreSettings;
  theme: Theme;
  isFreePlan: boolean;
}

export function StoreFooter({ store, theme, isFreePlan }: StoreFooterProps) {
  const t = theme.tokens;
  const legalPages = store.legalPages || {};

  const [openPage, setOpenPage] = useState<keyof LegalPages | null>(null);

  const pagesMap: { key: keyof LegalPages; title: string }[] = [
    { key: 'shipping', title: 'Shipping Policy' },
    { key: 'returns', title: 'Returns & Refunds' },
    { key: 'privacy', title: 'Privacy Policy' },
    { key: 'terms', title: 'Terms of Service' },
  ];

  const activePages = pagesMap.filter(p => Boolean(legalPages[p.key]?.trim()));

  return (
    <>
      <footer
        className="border-t pb-28 pt-10 text-center text-sm transition-colors duration-300 px-4 mt-auto"
        style={{ background: t.footerBg, borderColor: t.footerBorder, color: t.footerText }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center">
          
          {/* Legal Pages Links */}
          {activePages.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-8">
              {activePages.map(page => (
                <button
                  key={page.key}
                  onClick={() => setOpenPage(page.key)}
                  className="text-xs hover:underline decoration-1 underline-offset-4 opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap"
                  style={{ color: t.footerText }}
                >
                  {page.title}
                </button>
              ))}
            </div>
          )}

          {/* Copyright */}
          <p>
            Copyright &copy; {new Date().getFullYear()}{' '}
            <span className="font-semibold" style={{ color: t.pageText }}>{store.name}</span>
          </p>

          {/* Demo/Free watermark */}
          {isFreePlan && (
            <p className="mt-2 text-xs opacity-70">
              Powered by{' '}
              <a href="https://myshoplink.site" target="_blank" rel="noreferrer" className="font-semibold hover:underline underline-offset-2 transition-all">
                MyShopLink
              </a>
            </p>
          )}
        </div>
      </footer>

      {/* Dynamic Modal for Legal Pages */}
      <Modal
        isOpen={openPage !== null}
        onClose={() => setOpenPage(null)}
        title={openPage ? pagesMap.find(p => p.key === openPage)?.title || '' : ''}
      >
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {openPage ? legalPages[openPage] : ''}
        </div>
      </Modal>
    </>
  );
}
