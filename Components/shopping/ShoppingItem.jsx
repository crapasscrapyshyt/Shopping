import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Minus, Plus, ChevronDown } from 'lucide-react';

export default function ShoppingItem({
  item,
  isSelected,
  quantity,
  selectedSubType,
  onToggle,
  onQuantityChange,
  onSubTypeChange,
  estimatedPrice,
  actualPrice,
  onEstimatedPriceChange,
  onActualPriceChange,
}) {
  const [showSubTypesDialog, setShowSubTypesDialog] = useState(false);

  const handleIncrement = (e) => {
    e.stopPropagation();
    onQuantityChange(quantity + (item.step || (item.unit === 'ק"ג' ? 0.5 : 1)));
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    const step = item.step || (item.unit === 'ק"ג' ? 0.5 : 1);
    const min = item.min || (item.unit === 'ק"ג' ? 0.5 : 1);
    onQuantityChange(Math.max(min, quantity - step));
  };

  const handleSubTypeSelect = (subType) => {
    // Toggle subtype in array
    const currentSubTypes = Array.isArray(selectedSubType) ? selectedSubType : (selectedSubType ? [selectedSubType] : []);
    let newSubTypes;
    
    if (currentSubTypes.includes(subType)) {
      newSubTypes = currentSubTypes.filter(st => st !== subType);
    } else {
      newSubTypes = [...currentSubTypes, subType];
    }
    
    onSubTypeChange(newSubTypes);
    
    // Auto-select item if selecting subtypes
    if (newSubTypes.length > 0 && !isSelected) {
      onToggle();
    }
    // Auto-deselect item if no subtypes selected
    if (newSubTypes.length === 0 && isSelected) {
      onToggle();
    }
  };

  const getSelectedSubTypesArray = () => {
    if (!selectedSubType) return [];
    return Array.isArray(selectedSubType) ? selectedSubType : [selectedSubType];
  };

  const selectedSubTypesArray = getSelectedSubTypesArray();

  const handleItemClick = () => {
    if (item.hasSubTypes) {
      setShowSubTypesDialog(true);
    } else {
      onToggle();
    }
  };

  return (
    <>
      <div className="flex flex-col rounded-xl overflow-hidden">
        <div
          onClick={handleItemClick}
          className={`
            flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all duration-200
            ${isSelected 
              ? 'bg-teal-50 border border-teal-200' 
              : 'hover:bg-gray-50 border border-transparent'
            }
          `}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={(e) => {
              e.stopPropagation?.();
              if (!item.hasSubTypes) {
                onToggle();
              } else {
                setShowSubTypesDialog(true);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
          />
          
          <span className={`
            flex-1 text-sm transition-colors duration-200 min-w-0 truncate
            ${isSelected ? 'text-teal-800 font-medium' : 'text-gray-700'}
            ${item.isCustom ? 'italic' : ''}
          `}>
            {item.name}
            {selectedSubTypesArray.length > 0 && (
              <span className="text-xs text-teal-600 mr-1">
                ({selectedSubTypesArray.length > 2 ? `${selectedSubTypesArray.length} סוגים` : selectedSubTypesArray.join(', ')})
              </span>
            )}
          </span>

          {item.hasSubTypes && (
            <button
 
