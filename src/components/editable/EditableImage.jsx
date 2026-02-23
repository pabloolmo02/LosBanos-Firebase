import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import { useEditMode } from '@/contexts/EditModeContext';

const EditableImage = ({
  contentKey,
  fallback,
  className,
  alt,
  ...rest
}) => {
  const { user } = useAuth();
  const { getValue, setValue } = useContent();
  const { enabled } = useEditMode();

  const canEdit = enabled && user?.role === 'admin';
  const value = getValue(contentKey, fallback);

  const handleClick = () => {
    if (!canEdit) return;
    const nextValue = window.prompt('Nueva URL de imagen:', value || '') || '';
    if (nextValue.trim() && nextValue.trim() !== (value || '').trim()) {
      setValue(contentKey, nextValue.trim());
    }
  };

  return (
    <img
      src={value}
      alt={alt}
      className={className}
      data-editable={canEdit ? 'true' : 'false'}
      onClick={(event) => {
        if (canEdit) {
          event.preventDefault();
          event.stopPropagation();
        }
        handleClick();
      }}
      {...rest}
    />
  );
};

export default EditableImage;
