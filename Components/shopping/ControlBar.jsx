import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Trash2, Plus, Search, X } from 'lucide-react';

export default function ControlBar({
  categoryList,
  activeCategory,
  onCategoryChange,
  onShowAll,
  onClearAll,
  onAddItem,
  categories,
  searchQuery,
  onSearchChange,
}) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleAddItem = () => {
    if (newItemName.trim() && newItemCategory) {
      onAddItem(newItemCategory, newItemName);
      setNewItemName('');
      setShowAddForm(false);
    }
  };

  const availableCategories = categoryList.filter(c => c !== 'כל הקטגוריות');

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      {/* Search Bar */}
      {showSearch ? (
        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="חיפוש מוצר..."
              className="h-11 pr-10 rounded-xl border-gray-200"
              autoFocus
            />
          </div>
          <Button
            onClick={() => {
              setShowSearch(false);
              onSearchChange('');
            }}
            variant="outline"
            className="h-11 rounded-xl border-gray-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setShowSearch(true)}
          variant="outline"
          className="w-full h-11 rounded-xl text-sm border-gray-200 hover:bg-gray-50"
        >
          <Search className="w-4 h-4 ml-2" />
          חיפוש מוצר...
        </Button>
      )}

      {/* Category Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">קטגוריה להצגה:</label>
          <Select value={activeCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full h-11 text-sm rounded-xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryList.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 sm:items-end">
          <Button
            onClick={onShowAll}
            variant="outline"
            className="flex-1 sm:flex-none h-11 rounded-xl text-sm border-gray-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"
          >
            <Eye className="w-4 h-4 ml-1" />
            הצג הכל
          </Button>
          <Button
            onClick={onClearAll}
            variant="outline"
            className="flex-1 sm:flex-none h-11 rounded-xl text-sm border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 className="w-4 h-4 ml-1" />
            נקה סימונים
          </Button>
        </div>
      </div>

      {/* Add New Item Section */}
      {!showAddForm ? (
        <Button
          onClick={() => setShowAddForm(true)}
          variant="ghost"
          className="w-full h-11 rounded-xl text-sm text-gray-500 hover:text-teal-700 hover:bg-teal-50 border border-dashed border-gray-300"
        >
          <Plus className="w-4 h-4 ml-1" />
          הוספת פריט חדש לרשימה...
        </Button>
      ) : (
        <div className="space-y-2 p-3 bg-gray-50 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex gap-2">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="שם הפריט..."
              className="flex-1 h-11 rounded-xl border-gray-200"
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <Select value={newItemCategory} onValueChange={setNewItemCategory}>
              <SelectTrigger className="w-32 h-11 text-sm rounded-xl border-gray-200">
                <SelectValue placeholder="קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddItem}
              disabled={!newItemName.trim() || !newItemCategory}
              className="flex-1 h-10 rounded-xl bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Plus className="w-4 h-4 ml-1" />
              הוסף פריט
            </Button>
            <Button
              onClick={() => {
                setShowAddForm(false);
                setNewItemName('');
                setNewItemCategory('');
              }}
              variant="outline"
              className="h-10 rounded-xl border-gray-200"
            >
              ביטול
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
