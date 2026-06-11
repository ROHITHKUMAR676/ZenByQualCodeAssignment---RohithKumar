import React, { useEffect } from 'react';
import { Button } from '@carbon/react';
import { Close } from '@carbon/icons-react';

/**
 * Custom right-side drawer (replaces @carbon/react SidePanel which isn't in v1.x)
 */
const SideDrawer = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  bodyClassName = '',
  footerContent,
  compact = false,
}) => {
  const widthMap = { sm: '400px', md: '480px', lg: '640px' };

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 8000,
        }}
      />

      {/* Panel */}
      <div
        className={`side-drawer ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: widthMap[size],
          maxWidth: '100vw',
          background: '#fff',
          zIndex: 8001,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: compact ? '1rem 1rem 0.875rem' : '1.25rem 1.5rem 1rem',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ fontSize: compact ? '1rem' : '1.25rem', fontWeight: compact ? 400 : 600, margin: 0, color: '#161616' }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: '0.875rem', color: '#525252', marginTop: '0.25rem', marginBottom: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Close}
            iconDescription="Close"
            hasIconOnly
            onClick={onClose}
            style={{ marginLeft: '1rem', flexShrink: 0 }}
          />
        </div>

        {/* Body */}
        <div className={bodyClassName} style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>

        {/* Footer */}
        {footerContent ? (
          footerContent
        ) : (primaryAction || secondaryAction) && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'flex-end',
          }}>
            {secondaryAction && (
              <Button
                kind="secondary"
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled || secondaryAction.loading}
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                kind="primary"
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled || primaryAction.loading}
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SideDrawer;
