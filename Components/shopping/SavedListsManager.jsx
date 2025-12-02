import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, FolderOpen, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function SavedListsManager({
  savedLists,
  isLoading,
  onSaveList,
  onLoadList,
  onDeleteList,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!newListName.trim()) {
      toast.error('יש להזין שם לרשימה');
      return;
    }
    setIsSaving(true);
    await onSaveList(newListName.trim());
    setIsSaving(false);
    setNewListName('');
    setShowSaveDialog(false);
  };

  const handleDelete = async (e, listId) => {
    e.stopPropagation();
    if (confirm('האם למחוק את הרשימה?')) {
      await onDeleteList(listId);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-gray-700">רשימות שמורות</span>
          {savedLists.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
              {savedLists.length}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Save New Button */}
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl text-sm border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                <Save className="w-4 h-4 ml-2" />
                שמור רשימה נוכחית
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">שמירת רשימה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="שם הרשימה..."
                  className="h-11 rounded-xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  autoFocus
                />
                <Button
                  onClick={handleSave}
                  disabled={!newListName.trim() || isSaving}
                  className="w-full h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600"
                >
                  {isSaving ? 'שומר...' : 'שמור'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Saved Lists */}
          {isLoading ? (
            <div className="text-center py-4 text-gray-400 text-sm">טוען...</div>
          ) : savedLists.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              אין רשימות שמורות
            </div>
          ) : (
            <div className="space-y-2">
              {savedLists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => onLoadList(list)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer transition-all group"
                >
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                  <span className="flex-1 text-sm text-gray-700">{list.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(list.created_date).toLocaleDateString('he-IL')}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, list.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
