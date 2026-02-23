import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import { useEditMode } from '@/contexts/EditModeContext';

const EditableText = ({
  as: Tag = 'span',
  contentKey,
  fallback,
  className,
  placeholder,
  ...rest
}) => {
  const { user } = useAuth();
  const { getValue, setValue } = useContent();
  const { enabled } = useEditMode();

  const canEdit = enabled && user?.role === 'admin';
  const value = getValue(contentKey, fallback);
  const displayValue = value || placeholder || '';

  const handleBlur = (event) => {
    if (!canEdit) return;
    const nextValue = event.currentTarget.textContent || '';
    if (nextValue.trim() !== (value || '').trim()) {
      setValue(contentKey, nextValue.trim());
    }
  };

  const handleClick = (event) => {
    if (!canEdit) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Tag
      className={className}
      contentEditable={canEdit}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onClick={handleClick}
      data-editable={canEdit ? 'true' : 'false'}
      {...rest}
    >
      {displayValue}
    </Tag>
  );
};

export default EditableText;
