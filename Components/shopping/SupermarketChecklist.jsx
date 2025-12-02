import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, ListChecks, CheckCircle2 } from 'lucide-react';

export default function SupermarketChecklist({
  categories,
  quantities,
  boughtItems,
  onBoughtToggle,
  onGenerateCompletionList,
}) {
  const hasItems = Object.keys(categories).length > 0;
  
  const totalItems = Object.values(categories).reduce(
    (sum, items) => sum + items.length, 0
  );
  
  const boughtCount = Object.values(categories).reduce((sum, items) => {
    return sum + items.filter(item => {
      const key = `${Object.keys(categories).find(cat => 
        categories[cat].includes(item)
      )}|${item.name}`;
      return boughtItems[key];
    }).length;
  }, 0);

  const allBought = totalItems > 0 && boughtCount === totalItems;

  return (
    <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-500" />
            צ'ק ליסט בסופר
          </h2>
          {hasItems && (
            <span className={`
              px-2.5 py-1 text-xs font-medium rounded-full transition-colors duration-200
              ${allBought 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
              }
            `}>
              {boughtCount}/{totalItems}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!hasItems ? (
          <div className="text-center py-8 text-gray-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              סמנו פריטים ברשימה ולחצו על "צ'ק ליסט לסופר"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(categories).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  {category}
                </h3>
                <div className="space-y-1">
                  {items.map(item => {
                    const key = `${category}|${item.name}`;
                    const isBought = boughtItems[key];
                    const qty = quantities[key] || 1;
                    
                    return (
                      <div
                        key={item.name}
                        onClick={() => onBoughtToggle(category, item.name)}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                          ${isBought 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-gray-50 border border-gray-100 hover:border-gray-200'
                          }
                        `}
                      >
                        <Checkbox
                          checked={isBought}
                          className="h-6 w-6 rounded-lg border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 pointer-events-none"
                        />
                        
                        <span className={`
                          flex-1 text-sm transition-all duration-200
                          ${isBought 
                            ? 'text-green-700 line-through opacity-60' 
                            : 'text-gray-700'
                          }
                        `}>
                          {item.name}
                        </span>
                        
                        <span className={`
                          text-xs px-2 py-0.5 rounded-full transition-colors duration-200
                          ${isBought 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-200 text-gray-600'
                          }
                        `}>
                          {qty} {item.unit}
                        </span>
                        
                        {isBought && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 animate-in zoom-in duration-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Completion List Button */}
            <Button
              onClick={onGenerateCompletionList}
              variant="outline"
              className="w-full h-12 rounded-xl text-sm border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 mt-4"
            >
              <ListChecks className="w-4 h-4 ml-2" />
              יצירת רשימת השלמות
            </Button>

            {/* Success Message */}
            {allBought && (
              <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">סיימתם! כל הפריטים נלקחו 🎉</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
