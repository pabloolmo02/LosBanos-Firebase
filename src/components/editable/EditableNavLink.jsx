import React from 'react';
import { Link } from 'react-router-dom';
import { Link2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import { useEditMode } from '@/contexts/EditModeContext';
import EditableText from '@/components/editable/EditableText';

const EditableNavLink = ({
  contentKeyLabel,
  contentKeyHref,
  fallbackLabel,
  fallbackHref,
  className,
  onNavigate,
  iconOnly = false,
  title
}) => {
  const { user } = useAuth();
  const { getValue, setValue } = useContent();
  const { enabled } = useEditMode();

  const canEdit = enabled && user?.role === 'admin';
  const href = getValue(contentKeyHref, fallbackHref);

  const handleHrefEdit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nextValue = window.prompt('Nueva ruta o URL:', href || '') || '';
    if (nextValue.trim() && nextValue.trim() !== (href || '').trim()) {
      setValue(contentKeyHref, nextValue.trim());
    }
  };

  if (canEdit) {
    return (
      <span className={className}>
        {iconOnly ? (
          <span title={title || fallbackLabel}>
            <EditableText as="span" contentKey={contentKeyLabel} fallback={fallbackLabel} />
          </span>
        ) : (
          <EditableText as="span" contentKey={contentKeyLabel} fallback={fallbackLabel} />
        )}
        <button
          type="button"
          aria-label="Editar enlace"
          onClick={handleHrefEdit}
          className="ml-2 inline-flex items-center text-xs text-slate-500 hover:text-slate-700"
        >
          <Link2 className="h-3 w-3" />
        </button>
      </span>
    );
  }

  return (
    <Link to={href || fallbackHref} className={className} onClick={onNavigate} title={title}>
      {fallbackLabel ? (
        <EditableText as="span" contentKey={contentKeyLabel} fallback={fallbackLabel} />
      ) : null}
    </Link>
  );
};

export default EditableNavLink;
