'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Edit3 } from 'lucide-react';

interface ThoughtBubbleProps {
  text: string;
  isOwner?: boolean;
  onEdit?: (newText: string) => void;
  className?: string;
}

export function ThoughtBubble({ text, isOwner = false, onEdit, className }: ThoughtBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleSave = () => {
    if (onEdit && editText.trim()) {
      onEdit(editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!text && !isOwner) return null;

  return (
    <div className={cn("absolute -top-4 -right-20 group", className)}>
      {/* Main bubble */}
      <div className="relative max-w-[120px]">
        {/* Bubble content */}
        <div className="relative bg-white border-2 border-gray-200 rounded-2xl px-2 py-1.5 shadow-lg">
          {isEditing ? (
            <div className="space-y-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-xs resize-none border-none outline-none bg-transparent"
                placeholder="Escribe tu pensamiento..."
                rows={1}
                maxLength={25}
                autoFocus
              />
              <div className="text-right">
                <span className="text-xs text-gray-400">{editText.length}/25</span>
              </div>
              <div className="flex gap-1 justify-end">
                <button
                  onClick={handleSave}
                  className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancel}
                  className="px-1.5 py-0.5 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <p className="text-xs text-gray-800 leading-tight">
                {text || (isOwner ? 'Agrega un pensamiento...' : '')}
              </p>
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute -top-0.5 -right-0.5 p-0.5 rounded-full bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Editar pensamiento"
                >
                  <Edit3 className="h-2.5 w-2.5 text-gray-600" />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Small bubbles leading to main bubble - positioned to come from avatar */}
        <div className="absolute bottom-2 left-6 flex space-x-1">
          <div className="w-1 h-1 bg-white border border-gray-200 rounded-full shadow-sm"></div>
          <div className="w-1.5 h-1.5 bg-white border border-gray-200 rounded-full shadow-sm"></div>
          <div className="w-2 h-2 bg-white border border-gray-200 rounded-full shadow-sm"></div>
        </div>
      </div>
    </div>
  );
}
