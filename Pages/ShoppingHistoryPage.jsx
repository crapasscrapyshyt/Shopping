import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  History, Calendar as CalendarIcon, ShoppingCart, 
  ChevronDown, ChevronUp, ArrowUpDown, Filter, X 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ShoppingHistoryPage() {
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['shoppingHistory'],
    queryFn: () => base44.entities.ShoppingHistory.list('-date'),
  });

  // Filter and sort
  const filteredHistory = history
    .filter(item => {
      if (dateFrom && new Date(item.date) < dateFrom) return false;
      if (dateTo && new Date(item.date) > dateTo) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const totalSpent = filteredHistory.reduce((sum, item) => sum + (item.total || 0), 0);

  const clearFilters = () => {
    setDateFrom(null);
    setDateTo(null);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#F0F7F4] to-[#E8F4F8] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
              <History className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">היסטוריית קניות</h1>
          </div>
          <Link to={createPageUrl('ShoppingList')}>
            <Button variant="outline" size="sm" className="rounded-xl">
              <ShoppingCart className="w-4 h-4 ml-1" />
              חזרה לרשימה
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">סינון ומיון</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Date From */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-xl text-sm">
                    <CalendarIcon className="w-4 h-4 ml-2" />
                    {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'מתאריך'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    locale={he}
                  />
                </PopoverContent>
              </Popover>

              {/* Date To */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-xl text-sm">
                    <CalendarIcon className="w-4 h-4 ml-2" />
                    {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'עד תאריך'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    locale={he}
                  />
                </PopoverContent>
              </Popover>

              {/* Sort */}
              <Button
                variant="outline"
                className="h-10 rounded-xl text-sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                <ArrowUpDown className="w-4 h-4 ml-2" />
                {sortOrder === 'desc' ? 'החדש קודם' : 'הישן קודם'}
              </Button>

              {/* Clear */}
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  className="h-10 rounded-xl text-sm text-red-500 hover:text-red-600"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4 ml-1" />
                  נקה סינון
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">סה"כ הוצאות בתקופה:</span>
            <span className="text-2xl font-bold text-purple-600">₪{totalSpent.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {filteredHistory.length} קניות
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">טוען...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">אין היסטוריית קניות</p>
            <p className="text-sm text-gray-400 mt-1">קניות יישמרו אוטומטית לאחר סריקת קבלה</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((purchase) => (
              <Card key={purchase.id} className="overflow-hidden">
                <CardHeader 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === purchase.id ? null : purchase.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">
                        {format(new Date(purchase.date), 'EEEE, dd/MM/yyyy', { locale: he })}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {purchase.items?.length || 0} פריטים
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-purple-600">
                        ₪{(purchase.total || 0).toLocaleString()}
                      </span>
                      {expandedId === purchase.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedId === purchase.id && purchase.items && (
                  <CardContent className="p-4 pt-0 border-t">
                    <div className="space-y-2 mt-3">
                      {purchase.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">{item.name}</span>
                            {item.quantity > 1 && (
                              <span className="text-xs text-gray-500">x{item.quantity}</span>
                            )}
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              {item.category}
                            </span>
                          </div>
                          <span className="font-medium text-gray-600">₪{item.price?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {purchase.notes && (
                      <div className="mt-3 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                        {purchase.notes}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
