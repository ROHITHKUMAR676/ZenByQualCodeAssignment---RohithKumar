import React from 'react';
import { Tag, Button } from '@carbon/react';
import SideDrawer from '../shared/SideDrawer';
import StatusBadge from '../shared/StatusBadge';
import dayjs from 'dayjs';

const ViewModuleDrawer = ({ open, onClose, module, onEdit }) => {
  if (!module) return null;

  const publishDate = module.publishDate
    ? dayjs(module.publishDate).format('DD MMM YYYY')
    : '-';

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={module.moduleName}
      size="md"
      primaryAction={{
        label: 'Open Module Editor',
        onClick: onEdit,
      }}
    >
      <div style={{ padding: '1.5rem' }}>
        {/* Summary */}
        <div className="drawer-section">
          <div className="drawer-section__title drawer-section__title--with-ai">
            <span>Summary</span>
            <span className="ai-pill">AI</span>
          </div>
          <p className="drawer-summary">
            {module.summary || 'No generated summary available.'}
          </p>
        </div>

        {/* Tags */}
        {module.tags?.length > 0 && (
          <div className="drawer-section">
            <p className="drawer-section__title">Tags</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {module.tags.map((tag) => (
                <Tag key={tag} type="blue" size="sm">{tag}</Tag>
              ))}
            </div>
          </div>
        )}

        {/* Facilitator Guide / Notes */}
        <div className="drawer-section">
          <p className="drawer-section__title">Facilitator Guide</p>
          {module.notes?.length > 0 ? (
            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
              {module.notes.map((note, i) => (
                <li key={i} style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '0.5rem' }}>
                  {note.text || note}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#8d8d8d' }}>No notes added yet.</p>
          )}
        </div>

        {/* Overview / Metadata */}
        <div className="drawer-section">
          <p className="drawer-section__title">Overview</p>
          <div className="drawer-meta-grid">
            <div className="drawer-meta-item">
              <p className="drawer-meta-item__label">Publish Date</p>
              <p className="drawer-meta-item__value">{publishDate}</p>
            </div>
            <div className="drawer-meta-item">
              <p className="drawer-meta-item__label">Author</p>
              <p className="drawer-meta-item__value">{module.author || '-'}</p>
            </div>
            <div className="drawer-meta-item">
              <p className="drawer-meta-item__label">Category</p>
              <p className="drawer-meta-item__value">{module.category || '-'}</p>
            </div>
            <div className="drawer-meta-item">
              <p className="drawer-meta-item__label">Target Group</p>
              <p className="drawer-meta-item__value">{module.targetGroup || '-'}</p>
            </div>
            <div className="drawer-meta-item">
              <p className="drawer-meta-item__label">Program</p>
              <p className="drawer-meta-item__value">{module.program || '-'}</p>
            </div>
            <div className="drawer-meta-item">
              <p className="drawer-meta-item__label">Status</p>
              <StatusBadge status={module.status} />
            </div>
            {module.serviceComponent && (
              <div className="drawer-meta-item">
                <p className="drawer-meta-item__label">Service Component</p>
                <p className="drawer-meta-item__value">{module.serviceComponent}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};

export default ViewModuleDrawer;
