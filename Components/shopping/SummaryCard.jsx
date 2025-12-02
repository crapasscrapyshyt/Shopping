import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, ShoppingBag, ChevronDown, ChevronUp,
  Trash2, Copy, RotateCcw, Check 
} from 'lucide-react';
import { toast } from 'sonner';

export default function SummaryCard({
  summaryText,
  onGenerateList,
  onGenerateChecklist,
  onClearSummary,
  onClearSelections,
  onCopyToClipboard,
  onFullReset,
}) {
  const [showMore, setShowMore] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyToClipboard();
    setCopied(true);
    toast.success('הרשימה הועתקה ללוח!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-500" />
          רשימה מסוכמת להעתקה / צ'ק ליסט
        </h2>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Primary Actions */}
        <div className="flex gap-2">
          <Button
            onClick={onGenerateList}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium shadow-sm transition-all duration-200 active:scale-[0.98]"
          >
            <FileText className="w-4 h-4 ml-2" />
            יצירת רשימה
          </Button>
          <Button
            onClick={onGenerateChecklist}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-sm transition-all duration-200 active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4 ml-2" />
            צ'ק ליסט לסופר
          </Button>
        </div>

        {/* More Actions Toggle */}
        <Button
          onClick={() => setShowMore(!showMore)}
          variant="ghost"
          className="w-full h-9 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        >
          עוד פעולות
          {showMore ? (
            <ChevronUp className="w-4 h-4 mr-1" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-1" />
          )}
        </Button>

        {/* Secondary Actions */}
        {showMore && (
          <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
            <Button
              onClick={onClearSummary}
              variant="outline"
              className="h-10 rounded-xl text-sm border-gray-200 hover:bg-gray-50"
            >
              <Trash2 className="w-3.5 h-3.5 ml-1" />
              מחיקת רשימה
            </Button>
            <Button
              onClick={onClearSelections}
              variant="outline"
              className="h-10 rounded-xl text-sm border-gray-200 hover:bg-gray-50"
            >
              <RotateCcw className="w-3.5 h-3.5 ml-1" />
              נקה סימונים
            </Button>
            <Button
              onClick={handleCopy}
              variant="outline"
              disabled={!summaryText}
              className="h-10 rounded-xl text-sm border-gray-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 disabled:opacity-50"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 ml-1 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 ml-1" />
              )}
              {copied ? 'הועתק!' : 'העתק רשימה'}
            </Button>
            <Button
              onClick={onFullReset}
              variant="outline"
              className="h-10 rounded-xl text-sm border-red-200 text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="w-3.5 h-3.5 ml-1" />
              איפוס מלא
            </Button>
          </div>
        )}

        {/* Summary Textarea */}
        {summaryText && (
          <Textarea
            value={summaryText}
            readOnly
            className="min-h-[200px] rounded-xl border-gray-200 bg-gray-50 text-sm font-mono resize-none animate-in fade-in duration-200"
            dir="rtl"
          />
        )}
      </div>
    </div>
  );
}
