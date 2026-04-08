'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, content, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-sm"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-gray-900">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-sm leading-relaxed text-gray-600 prose prose-sm max-w-none">
          {content}
        </div>
      </div>
    </div>
  );
}

interface ProductAccordionProps {
  description: string;
  detailsTitle?: string;
  shippingTitle?: string;
  shippingInfo?: ReactNode;
  shippingContent?: string;
  careTitle?: string;
  careInstructions?: ReactNode;
  careContent?: string;
  sizeGuide?: ReactNode;
}

function renderMultilineContent(content: string) {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  const looksLikeList = lines.length > 1;

  if (looksLikeList) {
    return (
      <ul className="list-disc pl-4 space-y-1">
        {lines.map((line, index) => (
          <li key={`${line}-${index}`}>{line.replace(/^[-*]\s*/, '')}</li>
        ))}
      </ul>
    );
  }

  return <p>{lines[0]}</p>;
}

export function ProductAccordion({
  description,
  detailsTitle,
  shippingTitle,
  shippingInfo,
  shippingContent,
  careTitle,
  careInstructions,
  careContent,
  sizeGuide,
}: ProductAccordionProps) {
  const hasCustomShippingContent = shippingContent !== undefined;
  const hasCustomCareContent = careContent !== undefined;
  const shippingSectionContent = hasCustomShippingContent ? renderMultilineContent(shippingContent ?? '') : null;
  const careSectionContent = hasCustomCareContent ? renderMultilineContent(careContent ?? '') : null;

  return (
    <div className="w-full mt-10">
      <AccordionItem title={detailsTitle?.trim() || 'Product Details'} content={<p>{description}</p>} defaultOpen />
      
      {sizeGuide && (
        <AccordionItem title="Size Guide" content={sizeGuide} />
      )}
      
      {(!hasCustomShippingContent || shippingSectionContent || shippingInfo) && (
        <AccordionItem 
          title={shippingTitle?.trim() || 'Shipping & Returns'} 
          content={
            shippingInfo || shippingSectionContent || (
              <>
                <p className="mb-2"><strong>Standard Shipping:</strong> 3-5 business days. Free on orders over $100.</p>
                <p><strong>Returns:</strong> 7-day hassle-free returns. Item must be unworn and in original packaging.</p>
              </>
            )
          } 
        />
      )}
      
      {(!hasCustomCareContent || careSectionContent || careInstructions) && (
        <AccordionItem 
          title={careTitle?.trim() || 'Care Instructions'} 
          content={
            careInstructions || careSectionContent || (
              <ul className="list-disc pl-4 space-y-1">
                <li>Machine wash cold with like colors</li>
                <li>Tumble dry low or line dry</li>
                <li>Do not bleach</li>
                <li>Cool iron if needed</li>
              </ul>
            )
          } 
        />
      )}
    </div>
  );
}
