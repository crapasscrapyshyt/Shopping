import React, { useState } from 'react';
import ShoppingItem from './ShoppingItem';
import { 
  Apple, Milk, Croissant, Wheat, Package, Beef, 
  GlassWater, Sparkles, Heart, Home, Carrot, Cherry,
  Bird, Fish, Snowflake, ChevronDown, ChevronUp
} from 'lucide-react';

const CATEGORY_ICONS = {
  'ירקות': Carrot,
  'פירות': Cherry,
  'מוצרי חלב וביצים': Milk,
  'מאפים ולחמים': Croissant,
  'מזווה ותבלינים': Package,
  'עוף': Bird,
  'בשר': Beef,
  'דגים': Fish,
  'קפואים': Snowflake,
  'שתייה וחטיפים': GlassWater,
  'ניקיון וכביסה': Sparkles,
  'טואלטיקה': Heart,
  'שונות לבית': Home,
};

const CATEGORY_COLORS = {
  'ירקות': 'from-green-400 to-emerald-500',
  'פירות': 'from-red-400 to-orange-500',
  'מוצרי חלב וביצים': 'from-blue-400 to-sky-500',
  'מאפים ולחמים': 'from-amber-400 to-orange-500',
  'מזווה ותבלינים': 'from-rose-400 to-pink-500',
  'עוף': 'from-orange-400 to-amber-500',
  'בשר': 'from-red-500 to-rose-600',
  'דגים': 'from-blue-400 to-cyan-500',
  'קפואים': 'from-sky-400 to-blue-500',
  'שתייה וחטיפים': 'from-purple-400 to-violet-500',
  'ניקיון וכביסה': 'from-cyan-400 to-teal-500',
  'טואלטיקה': 'from-pink-400 to-rose-400',
  'שונות לבית': 'from-slate-400 to-gray-500',
};

export default function CategoryCard({
  category,
  items,
  selectedItems,
  quantities,
  subTypes,
  estimatedPrices,
  actualPrices,
  onItemToggle,
  onQuantityChange,
  onSubTypeChange,
  onEstimatedPriceChange,
  onActualPriceChange,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[category] || Package;
  const gradientClass = CATEGORY_COLORS[category] || 'from-gray-400 to-gray-500';
  
  const selectedCount = items.filter(item => 
    selectedItems[`${category}|${item.name}`]
  ).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header - Clickable */}
      <div 
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-base font-semibold text-gray-800 flex-1">{category}</h2>
        {selectedCount > 0 && (
          <span className="px-2.5 py-1 text-xs font-medium bg-teal-100 text-teal-700 rounded-full">
            {selectedCount} נבחרו
          </span>
        )}
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Items Grid - Collapsible */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {items.map(item => {
              const key = `${category}|${item.name}`;
              return (
                <ShoppingItem
                  key={item.name}
                  item={item}
                  isSelected={selectedItems[key]}
                  quantity={quantities[key] || 1}
                  selectedSubType={subTypes?.[key]}
                  estimatedPrice={estimatedPrices?.[key]}
                  actualPrice={actualPrices?.[key]}
                  onToggle={() => onItemToggle(category, item.name)}
                  onQuantityChange={(value) => onQuantityChange(category, item.name, value)}
                  onSubTypeChange={(subType) => onSubTypeChange?.(category, item.name, subType)}
                  onEstimatedPriceChange={(price) => onEstimatedPriceChange?.(category, item.name, price)}
                  onActualPriceChange={(price) => onActualPriceChange?.(category, item.name, price)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
