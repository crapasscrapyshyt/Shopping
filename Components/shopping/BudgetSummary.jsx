import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingUp, AlertTriangle, CheckCircle2, Edit2, X } from 'lucide-react';
import ReceiptScanner from './ReceiptScanner';
import BarcodeScanner from './BarcodeScanner';

export default function BudgetSummary({
  budget,
  onBudgetChange,
  estimatedTotal,
  actualTotal,
  itemsCount,
  selectedItems,
  categories,
  onPricesExtracted,
  onAddNewItems,
  onAddToList,
  onUpdatePrice,
}) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget || '');

  const handleSaveBudget = () => {
    onBudgetChange(parseFloat(tempBudget) || 0);
    setIsEditingBudget(false);
  };

  const handleClearBudget = () => {
    onBudgetChange(0);
    setTempBudget('');
    setIsEditingBudget(false);
  };

  const displayTotal = actualTotal > 0 ? actualTotal : estimatedTotal;
  const budgetProgress = budget > 0 ? Math.min((displayTotal / budget) * 100, 100) : 0;
  const isOverBudget = budget > 0 && displayTotal > budget;
  const remainingBudget = budget - displayTotal;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            סיכום עלויות ותקציב
          </h2>
          {itemsCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
              {itemsCount} פריטים
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Budget Setting */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 whitespace-nowrap">תקציב:</span>
          {isEditingBudget ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                placeholder="הזן תקציב..."
                className="h-9 rounded-lg flex-1"
                autoFocus
              />
              <span className="text-sm text-gray-500">₪</span>
              <Button
                onClick={handleSaveBudget}
                size="sm"
                className="h-9 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600"
              >
                שמור
              </Button>
              <Button
                onClick={() => setIsEditingBudget(false)}
                size="sm"
                variant="outline"
                className="h-9 px-2 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              {budget > 0 ? (
                <>
                  <span className="text-lg font-bold text-emerald-600">₪{budget.toLocaleString()}</span>
                  <Button
                    onClick={() => {
                      setTempBudget(budget.toString());
                      setIsEditingBudget(true);
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                  </Button>
                  <Button
                    onClick={handleClearBudget}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-red-400 hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditingBudget(true)}
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                >
                  הגדר תקציב
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar (if budget set) */}
        {budget > 0 && (
          <div className="space-y-2">
            <Progress 
              value={budgetProgress} 
              className={`h-3 ${isOverBudget ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`}
            />
            <div className="flex items-center justify-between text-xs">
              <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-gray-500'}>
                {budgetProgress.toFixed(0)}% מהתקציב
              </span>
              {isOverBudget ? (
                <span className="flex items-center gap-1 text-red-600 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  חריגה של ₪{Math.abs(remainingBudget).toLocaleString()}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  נותרו ₪{remainingBudget.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Scanners */}
        <div className="flex gap-2">
          <ReceiptScanner
            selectedItems={selectedItems}
            categories={categories}
            onPricesExtracted={onPricesExtracted}
            onAddNewItems={onAddNewItems}
          />
          <BarcodeScanner
            categories={categories}
            selectedItems={selectedItems}
            onAddToList={onAddToList}
            onUpdatePrice={onUpdatePrice}
          />
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <div className="text-xs text-blue-600 mb-1">סה"כ משוער</div>
            <div className="text-xl font-bold text-blue-700">
              ₪{estimatedTotal.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="text-xs text-emerald-600 mb-1">סה"כ בפועל</div>
            <div className="text-xl font-bold text-emerald-700">
              ₪{actualTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Difference */}
        {estimatedTotal > 0 && actualTotal > 0 && (
          <div className={`
            flex items-center justify-center gap-2 p-2 rounded-lg text-sm
            ${actualTotal <= estimatedTotal 
              ? 'bg-green-50 text-green-700' 
              : 'bg-orange-50 text-orange-700'
            }
          `}>
            <TrendingUp className="w-4 h-4" />
            {actualTotal <= estimatedTotal 
              ? `חסכת ₪${(estimatedTotal - actualTotal).toLocaleString()}!`
              : `הוצאת ₪${(actualTotal - estimatedTotal).toLocaleString()} יותר מהמשוער`
            }
          </div>
        )}
      </div>
    </div>
  );
}
