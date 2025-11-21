'use client';

import { useState, useEffect, useRef } from 'react';

interface ContentEditableProps {
  value: string;
  onChange: (value: string) => void;
  tagName?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export default function ContentEditable({
  value,
  onChange,
  tagName = 'div',
  className = '',
  disabled = false,
  placeholder = '',
}: ContentEditableProps) {
  const contentEditableRef = useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (contentEditableRef.current && value !== contentEditableRef.current.innerText) {
      contentEditableRef.current.innerText = value;
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const newValue = e.currentTarget.innerText;
    onChange(newValue);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      contentEditableRef.current?.blur();
    }
  };

  const Tag = tagName as any;

  return (
    <Tag
      ref={contentEditableRef}
      className={`outline-none transition-colors ${
        !disabled && isEditing ? 'ring-2 ring-blue-500 ring-opacity-50 rounded px-1 -mx-1 bg-white' : ''
      } ${!disabled ? 'hover:bg-blue-50 cursor-text rounded px-1 -mx-1' : ''} ${className}`}
      contentEditable={!disabled}
      onInput={handleInput}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning={true}
      data-placeholder={placeholder}
    />
  );
}
