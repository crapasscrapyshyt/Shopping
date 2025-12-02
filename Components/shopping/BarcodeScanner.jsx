import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scan, Camera, X, Check, Plus, Link2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CATEGORY_LIST = [
  'ירקות', 'פירות', 'מוצרי חלב וביצים', 'מאפים ולחמים', 
  'מזווה ותבלינים', 'עוף', 'בשר', 'דגים', 'קפואים', 
  'שתייה וחטיפים', 'ניקיון וכביסה', 'טואלטיקה', 'שונות לבית'
];

export default function BarcodeScanner({
  categories,
  selectedItems,
  onAddToList,
  onUpdatePrice,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [foundProduct, setFoundProduct] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mode, setMode] = useState('scan'); // 'scan', 'result', 'link', 'new'
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [linkToProduct, setLinkToProduct] = useState('');
  const [linkToCategory, setLinkToCategory] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch existing barcodes
  const { data: barcodes = [] } = useQuery({
    queryKey: ['productBarcodes'],
    queryFn: () => base44.entities.ProductBarcode.list(),
  });

  const createBarcodeMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductBarcode.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productBarcodes'] });
    },
  });

  const updateBarcodeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProductBarcode.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productBarcodes'] });
    },
  });

  // Get all products from categories
  const getAllProducts = () => {
    const products = [];
    Object.keys(categories).forEach(cat => {
      categories[cat].forEach(item => {
        products.push({ name: item.name, category: cat });
      });
    });
    return products;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('לא ניתן לגשת למצלמה');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen && mode === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, mode]);

  const handleBarcodeSubmit = async (barcode) => {
    if (!barcode || barcode.length < 4) {
      toast.error('נא להזין ברקוד תקין');
      return;
    }

    setIsSearching(true);
    setScannedBarcode(barcode);

    // Check if barcode exists in DB
    const existingBarcode = barcodes.find(b => b.barcode === barcode);
    
    if (existingBarcode) {
      setFoundProduct(existingBarcode);
      setMode('result');
    } else {
      // Try to identify via LLM
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `ברקוד: ${barcode}
נסה לזהות את המוצר לפי הברקוד. אם אתה מזהה מוצר ישראלי נפוץ, החזר את שמו וקטגוריה מתאימה.
קטגוריות אפשריות: ${CATEGORY_LIST.join(', ')}

אם אתה לא בטוח, החזר identified: false`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              identified: { type: "boolean" },
              product_name: { type: "string" },
              category: { type: "string" },
              confidence: { type: "string", enum: ["high", "medium", "low"] }
            }
          }
        });

        if (result.identified && result.confidence !== 'low') {
          setFoundProduct({
            barcode,
            product_name: result.product_name,
            category: result.category,
            is_new: true,
            from_llm: true
          });
          setMode('result');
        } else {
          setFoundProduct(null);
          setMode('new');
        }
      } catch (err) {
        console.error('LLM error:', err);
        setFoundProduct(null);
        setMode('new');
      }
    }
    
    setIsSearching(false);
    setManualBarcode('');
  };

  const handleAddToList = async () => {
    if (!foundProduct) return;

    const key = `${foundProduct.category}|${foundProduct.product_name}`;
    
    // Save barcode if new
    if (foundProduct.is_new || foundProduct.from_llm) {
      await createBarcodeMutation.mutateAsync({
        barcode: scannedBarcode,
        product_name: foundProduct.product_name,
        category: foundProduct.category,
        last_price: foundProduct.last_price || null,
      });
    }

    onAddToList(foundProduct.category, foundProduct.product_name);
    toast.success(`${foundProduct.product_name} נוסף לרשימה`);
    resetAndClose();
  };

  const handleUpdatePrice = async (price) => {
    if (!foundProduct || !price) return;

    const key = `${foundProduct.category}|${foundProduct.product_name}`;
    onUpdatePrice(foundProduct.category, foundProduct.product_name, parseFloat(price));

    // Update barcode price in DB
    const existingBarcode = barcodes.find(b => b.barcode === scannedBarcode);
    if (existingBarcode) {
      await updateBarcodeMutation.mutateAsync({
        id: existingBarcode.id,
        data: { last_price: parseFloat(price) }
      });
    }

    toast.success(`מחיר ${foundProduct.product_name} עודכן`);
    resetAndClose();
  };

  const handleLinkBarcode = async () => {
    if (!linkToProduct || !linkToCategory) {
      toast.error('נא לבחור מוצר');
      return;
    }

    await createBarcodeMutation.mutateAsync({
      barcode: scannedBarcode,
      product_name: linkToProduct,
      category: linkToCategory,
      last_price: null,
    });

    toast.success(`ברקוד קושר ל-${linkToProduct}`);
    resetAndClose();
  };

  const handleCreateNewProduct = async () => {
    if (!newProductName || !newProductCategory) {
      toast.error('נא למלא שם וקטגוריה');
      return;
    }

    await createBarcodeMutation.mutateAsync({
      barcode: scannedBarcode,
      product_name: newProductName,
      category: newProductCategory,
      last_price: newProductPrice ? parseFloat(newProductPrice) : null,
    });

    // Also add to custom products
    await base44.entities.CustomProduct.create({
      name: newProductName,
      category: newProductCategory,
      unit: 'יחידות',
      last_price: newProductPrice ? parseFloat(newProductPrice) : null,
    });
    queryClient.invalidateQueries({ queryKey: ['customProducts'] });

    toast.success(`${newProductName} נוסף למערכת`);
    resetAndClose();
  };

  const resetAndClose = () => {
    setIsOpen(false);
    setScannedBarcode(null);
    setFoundProduct(null);
    setMode('scan');
    setNewProductName('');
    setNewProductCategory('');
    setNewProductPrice('');
    setLinkToProduct('');
    setLinkToCategory('');
  };

  const allProducts = getAllProducts();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="h-11 rounded-xl text-sm border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
      >
        <Scan className="w-4 h-4 ml-2" />
        סריקת ברקוד
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetAndClose(); else setIsOpen(true); }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Scan className="w-5 h-5 text-blue-500" />
              סריקת ברקוד
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {mode === 'scan' && (
              <>
                {/* Camera Preview */}
                <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-24 border-2 border-blue-400 rounded-lg opacity-50" />
                  </div>
                </div>

                <p className="text-xs text-center text-gray-500">
                  כוון את המצלמה לברקוד או הזן ידנית
                </p>

                {/* Manual Input */}
                <div className="flex gap-2">
                  <Input
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="הזן ברקוד ידנית..."
                    className="flex-1 h-11 rounded-xl"
                    onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSubmit(manualBarcode)}
                  />
                  <Button
                    onClick={() => handleBarcodeSubmit(manualBarcode)}
                    disabled={!manualBarcode || isSearching}
                    className="h-11 rounded-xl bg-blue-500 hover:bg-blue-600"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'חפש'}
                  </Button>
                </div>

                {/* Link Mode Button */}
                <Button
                  variant="ghost"
                  className="w-full text-sm text-gray-500"
                  onClick={() => {
                    if (manualBarcode) {
                      setScannedBarcode(manualBarcode);
                      setMode('link');
                    } else {
                      toast.error('הזן ברקוד קודם');
                    }
                  }}
                >
                  <Link2 className="w-4 h-4 ml-1" />
                  קשר ברקוד למוצר קיים (ללא קנייה)
                </Button>
              </>
            )}

            {isSearching && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">מחפש מוצר...</p>
              </div>
            )}

            {mode === 'result' && foundProduct && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">מוצר זוהה!</span>
                  </div>
                  <div className="text-lg font-bold text-gray-800">{foundProduct.product_name}</div>
                  <div className="text-sm text-gray-500">{foundProduct.category}</div>
                  {foundProduct.last_price && (
                    <div className="text-sm text-green-600 mt-1">מחיר אחרון: ₪{foundProduct.last_price}</div>
                  )}
                  {foundProduct.from_llm && (
                    <div className="text-xs text-orange-500 mt-2">* זוהה אוטומטית - נא לאשר</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleAddToList}
                    className="h-11 rounded-xl bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    הוסף לרשימה
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMode('link')}
                    className="h-11 rounded-xl"
                  >
                    <Link2 className="w-4 h-4 ml-1" />
                    קשר למוצר אחר
                  </Button>
                </div>

                {/* Update Price */}
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="עדכן מחיר..."
                    className="flex-1 h-10 rounded-xl"
                    id="price-input"
                  />
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl"
                    onClick={() => {
                      const price = document.getElementById('price-input').value;
                      handleUpdatePrice(price);
                    }}
                  >
                    עדכן מחיר
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-gray-500"
                  onClick={() => { setMode('scan'); setFoundProduct(null); }}
                >
                  סרוק ברקוד אחר
                </Button>
              </div>
            )}

            {mode === 'link' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="text-sm text-blue-700">ברקוד: <span className="font-mono font-bold">{scannedBarcode}</span></div>
                </div>

                <p className="text-sm text-gray-600">בחר מוצר לקשר לברקוד זה:</p>

                <Select value={linkToCategory} onValueChange={(cat) => { setLinkToCategory(cat); setLinkToProduct(''); }}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_LIST.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {linkToCategory && (
                  <Select value={linkToProduct} onValueChange={setLinkToProduct}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="בחר מוצר" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories[linkToCategory] || []).map(item => (
                        <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleLinkBarcode}
                    disabled={!linkToProduct}
                    className="flex-1 h-11 rounded-xl bg-blue-500 hover:bg-blue-600"
                  >
                    <Link2 className="w-4 h-4 ml-1" />
                    קשר ברקוד
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMode('new')}
                    className="h-11 rounded-xl"
                  >
                    צור מוצר חדש
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-gray-500"
                  onClick={() => { setMode('scan'); setScannedBarcode(null); }}
                >
                  חזור
                </Button>
              </div>
            )}

            {mode === 'new' && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <div className="text-sm text-orange-700">ברקוד חדש: <span className="font-mono font-bold">{scannedBarcode}</span></div>
                </div>

                <p className="text-sm text-gray-600">הוסף מוצר חדש למערכת:</p>

                <Input
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="שם המוצר"
                  className="h-11 rounded-xl"
                />

                <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_LIST.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  placeholder="מחיר (אופציונלי)"
                  className="h-11 rounded-xl"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateNewProduct}
                    disabled={!newProductName || !newProductCategory}
                    className="flex-1 h-11 rounded-xl bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    הוסף מוצר חדש
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMode('link')}
                    className="h-11 rounded-xl"
                  >
                    קשר לקיים
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-gray-500"
                  onClick={() => { setMode('scan'); setScannedBarcode(null); }}
                >
                  חזור
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
