import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload, Loader2, Receipt, Check, X, Pencil, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const CATEGORY_LIST = [
  'ירקות', 'פירות', 'מוצרי חלב וביצים', 'מאפים ולחמים', 
  'מזווה ותבלינים', 'עוף', 'בשר', 'דגים', 'קפואים', 
  'שתייה וחטיפים', 'ניקיון וכביסה', 'טואלטיקה', 'שונות לבית'
];

function EditableReceiptItem({ item, allCategoryItems, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editPrice, setEditPrice] = useState(item.price.toString());
  const [editCategory, setEditCategory] = useState(item.category || '');

  const handleSave = () => {
    const existingCategory = allCategoryItems[editName];
    onUpdate({
      ...item,
      name: editName,
      price: parseFloat(editPrice) || 0,
      category: existingCategory || editCategory,
      is_existing_product: !!existingCategory,
      is_from_list: item.is_from_list,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg p-2 border border-blue-200 space-y-2">
        <div className="flex gap-2">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="שם המוצר"
            className="flex-1 h-8 text-sm"
          />
          <Input
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            placeholder="מחיר"
            className="w-20 h-8 text-sm"
          />
        </div>
        {!allCategoryItems[editName] && (
          <Select value={editCategory} onValueChange={setEditCategory}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="בחר קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_LIST.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 px-2">
            <X className="w-3 h-3" />
          </Button>
          <Button size="sm" onClick={handleSave} className="h-7 px-2 bg-blue-500 hover:bg-blue-600">
            <Check className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-between text-sm py-1.5 px-2 border-b border-green-100 last:border-0 hover:bg-white/50 rounded cursor-pointer group"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        <span className="text-gray-700 truncate">{item.name}</span>
        {!item.is_from_list && !item.is_existing_product && (
          <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded flex-shrink-0">חדש</span>
        )}
        {!item.is_from_list && item.is_existing_product && (
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded flex-shrink-0">קיים</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-green-700">₪{item.price.toFixed(2)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ReceiptScanner({
  selectedItems,
  categories,
  onPricesExtracted,
  onAddNewItems,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedPrices, setExtractedPrices] = useState(null);
  const fileInputRef = useRef(null);

  // Get list of selected item names for the prompt
  const getSelectedItemNames = () => {
    const items = [];
    Object.keys(selectedItems).forEach(key => {
      if (selectedItems[key]) {
        const [category, name] = key.split('|');
        items.push(name);
      }
    });
    return items;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setExtractedPrices(null);

    try {
      // Upload the file first
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const selectedItemNames = getSelectedItemNames();
      
      // Get all available items from categories for better matching
      const allCategoryItems = {};
      Object.keys(categories).forEach(cat => {
        categories[cat].forEach(item => {
          allCategoryItems[item.name] = cat;
        });
      });

      const hasSelectedItems = selectedItemNames.length > 0;

      // Use LLM to extract prices from receipt
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה קורא קבלה מסופר ישראלי. התמונה מכילה קבלה עם רשימת מוצרים.

**הוראות קריטיות - חובה לבצע:**
1. קרא את הטקסט המדויק שמופיע בתמונה בלבד
2. אל תמציא מוצרים שלא רואים בקבלה!
3. אל תנחש - אם לא ברור, דלג על השורה
4. קבלות ישראליות: המחיר בצד שמאל, שם המוצר בצד ימין

**מבנה שורת מוצר טיפוסית בקבלה:**
המחיר (מספר כמו 36.90) | מספר ברקוד | שם המוצר בעברית

**שורות להתעלם מהן:**
- סה"כ, ס.ביניים, לתשלום
- מע"מ, חייב במע"מ
- מספר עסקה, תאריך, שעה
- פרטי כרטיס אשראי
- שקיות (אלא אם רוצים לכלול)

**לאחר שקראת את המוצרים מהתמונה**, נסה להתאים לשמות אלו:
${Object.keys(allCategoryItems).slice(0, 60).join(', ')}

קטגוריות אפשריות: ירקות, פירות, מוצרי חלב וביצים, מאפים ולחמים, מזווה ותבלינים, עוף, בשר, דגים, קפואים, שתייה וחטיפים, ניקיון וכביסה, טואלטיקה, שונות לבית`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "שם המוצר (מהרשימה/מערכת אם קיים, אחרת שם נקי מהקבלה)" },
                  price: { type: "number", description: "המחיר בשקלים" },
                  receipt_name: { type: "string", description: "השם כפי שמופיע בקבלה" },
                  is_from_list: { type: "boolean", description: "האם המוצר ברשימת הקניות המקורית" },
                  is_existing_product: { type: "boolean", description: "האם המוצר קיים במערכת (גם אם לא ברשימה)" },
                  category: { type: "string", description: "הקטגוריה המתאימה למוצר" }
                }
              }
            },
            total: { type: "number", description: "סה״כ הקבלה" }
          }
        }
      });

      if (result.items && result.items.length > 0) {
        setExtractedPrices(result);
      } else {
        toast.error('לא נמצאו מוצרים בקבלה');
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('שגיאה בעיבוד הקבלה');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Get all available items from categories for better matching
  const getAllCategoryItems = () => {
    const allItems = {};
    Object.keys(categories).forEach(cat => {
      categories[cat].forEach(item => {
        allItems[item.name] = cat;
      });
    });
    return allItems;
  };

  const handleApplyPrices = () => {
    if (!extractedPrices?.items) return;

    const pricesMap = {};
    const newItems = [];
    const allCategoryItems = getAllCategoryItems();
    
    extractedPrices.items.forEach(item => {
      if (item.is_from_list) {
        // Find the matching key in selectedItems
        Object.keys(selectedItems).forEach(key => {
          if (selectedItems[key]) {
            const [category, name] = key.split('|');
            if (name === item.name || name.includes(item.name) || item.name.includes(name)) {
              pricesMap[key] = item.price;
            }
          }
        });
      } else if (item.is_existing_product && item.category) {
        // Existing product not in current list - just update price
        const key = `${item.category}|${item.name}`;
        pricesMap[key] = item.price;
      } else if (item.category) {
        // New item not in system
        newItems.push({
          name: item.name,
          price: item.price,
          category: item.category,
        });
      }
    });

    onPricesExtracted(pricesMap, newItems);
    
    const messages = [];
    if (Object.keys(pricesMap).length > 0) {
      messages.push(`עודכנו ${Object.keys(pricesMap).length} מחירים`);
    }
    if (newItems.length > 0) {
      messages.push(`נוספו ${newItems.length} פריטים חדשים`);
    }
    toast.success(messages.join(', ') || 'הקבלה עובדה');
    
    setIsOpen(false);
    setExtractedPrices(null);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="h-11 rounded-xl text-sm border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100"
      >
        <Receipt className="w-4 h-4 ml-2" />
        סריקת קבלה
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Receipt className="w-5 h-5 text-purple-500" />
              סריקת קבלה
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              העלה תמונה של הקבלה והמערכת תזהה אוטומטית את המחירים. מוצרים חדשים יתווספו לכולם ומחירים יישמרו.
            </p>

            {!extractedPrices && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-upload"
                />
                
                <label
                  htmlFor="receipt-upload"
                  className={`
                    flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${isProcessing 
                      ? 'border-purple-300 bg-purple-50' 
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                      <span className="text-sm text-purple-600">מעבד את הקבלה...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-purple-500" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-medium text-gray-700">לחץ להעלאת תמונה</span>
                        <p className="text-xs text-gray-500 mt-1">או צלם תמונה של הקבלה</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            )}

            {extractedPrices && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        נמצאו {extractedPrices.items.length} מוצרים
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">לחץ על פריט לעריכה</span>
                  </div>
                  
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {extractedPrices.items.map((item, idx) => (
                      <EditableReceiptItem
                        key={idx}
                        item={item}
                        allCategoryItems={getAllCategoryItems()}
                        onUpdate={(updatedItem) => {
                          setExtractedPrices(prev => ({
                            ...prev,
                            items: prev.items.map((it, i) => i === idx ? updatedItem : it)
                          }));
                        }}
                        onDelete={() => {
                          setExtractedPrices(prev => ({
                            ...prev,
                            items: prev.items.filter((_, i) => i !== idx)
                          }));
                        }}
                      />
                    ))}
                  </div>

                  {extractedPrices.total > 0 && (
                    <div className="flex justify-between text-sm pt-2 mt-2 border-t border-green-200 font-medium">
                      <span>סה״כ קבלה:</span>
                      <span>₪{extractedPrices.total.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleApplyPrices}
                    className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 ml-2" />
                    עדכן מחירים
                  </Button>
                  <Button
                    onClick={() => setExtractedPrices(null)}
                    variant="outline"
                    className="h-11 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
