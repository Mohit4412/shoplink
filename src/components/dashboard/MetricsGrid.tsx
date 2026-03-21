import React from 'react';
import { Package, Eye, MessageCircle, Percent, Clock, ShoppingCart, DollarSign, Euro, PoundSterling, IndianRupee, Banknote } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface MetricsGridProps {
  productsCount: number;
  rangeViews: number;
  rangeClicks: number;
  rangeOrdersCount: number;
  rangeRevenue: number;
  conversionRate: string;
  avgOrderValue: string;
  currencySymbol: string;
  periodLabel?: string;
}

const getCurrencyIcon = (symbol: string, className: string) => {
  switch (symbol) {
    case '€': return <Euro className={className} />;
    case '£': return <PoundSterling className={className} />;
    case '₹': return <IndianRupee className={className} />;
    case '$': 
    case 'A$':
    case 'C$':
      return <DollarSign className={className} />;
    default: return <Banknote className={className} />;
  }
};

export function MetricsGrid({
  productsCount,
  rangeViews,
  rangeClicks,
  rangeOrdersCount,
  rangeRevenue,
  conversionRate,
  avgOrderValue,
  currencySymbol,
  periodLabel = "Selected Period"
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard 
        icon={<Package className="w-5 h-5 text-gray-600" />}
        title="Total Products"
        value={productsCount.toString()}
        subtitle="Active & Drafts"
      />
      <MetricCard 
        icon={<Eye className="w-5 h-5 text-blue-600" />}
        title="Views"
        value={rangeViews.toLocaleString()}
        subtitle={periodLabel}
        valueColor="text-blue-600"
      />
      <MetricCard 
        icon={<MessageCircle className="w-5 h-5 text-blue-600" />}
        title="Clicks"
        value={rangeClicks.toLocaleString()}
        subtitle={periodLabel}
        valueColor="text-blue-600"
      />
      <MetricCard 
        icon={<Percent className="w-5 h-5 text-blue-600" />}
        title="CTR"
        value={`${((rangeClicks / Math.max(rangeViews, 1)) * 100).toFixed(1)}%`}
        subtitle={periodLabel}
        valueColor="text-blue-600"
      />
      
      <MetricCard 
        icon={<ShoppingCart className="w-5 h-5 text-green-600" />}
        title="Orders"
        value={rangeOrdersCount.toString()}
        subtitle={periodLabel}
        valueColor="text-green-600"
      />
      <MetricCard 
        icon={getCurrencyIcon(currencySymbol, "w-5 h-5 text-green-600")}
        title="Revenue"
        value={`${currencySymbol}${rangeRevenue.toFixed(2)}`}
        subtitle={periodLabel}
        valueColor="text-green-600"
      />
      <MetricCard 
        icon={<Percent className="w-5 h-5 text-green-600" />}
        title="Conv. Rate"
        value={`${conversionRate}%`}
        subtitle={periodLabel}
        valueColor="text-green-600"
      />
      <MetricCard 
        icon={getCurrencyIcon(currencySymbol, "w-5 h-5 text-green-600")}
        title="Avg. Order"
        value={`${currencySymbol}${avgOrderValue}`}
        subtitle={periodLabel}
        valueColor="text-green-600"
      />
    </div>
  );
}
