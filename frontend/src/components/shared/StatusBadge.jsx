import React from 'react';
import {
  CheckmarkFilled,
  WarningAltFilled,
  CircleDash,
  CircleFilled,
} from '@carbon/icons-react';

const STATUS_CONFIG = {
  Active: { className: 'active', icon: CheckmarkFilled, color: '#24a148' },
  Draft: { className: 'draft', icon: CircleFilled, color: '#6f6f6f' },
  'Pending Review': { className: 'pending', icon: CircleFilled, color: '#6f6f6f' },
  'Needs Changes': { className: 'needs-changes', icon: WarningAltFilled, color: '#f1c21b' },
  Approved: { className: 'approved', icon: CheckmarkFilled, color: '#24a148' },
  Rejected: { className: 'rejected', icon: CircleDash, color: '#da1e28' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Draft'];
  const Icon = config.icon;

  return (
    <span className="status-badge">
      <Icon size={16} style={{ color: config.color, flexShrink: 0 }} />
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
