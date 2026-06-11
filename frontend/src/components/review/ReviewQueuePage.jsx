import React, { useState, useEffect, useCallback } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Breadcrumb,
  BreadcrumbItem,
  Loading,
  InlineNotification,
  OverflowMenu,
  OverflowMenuItem,
  Tag,
} from '@carbon/react';
import {
  WarningAltFilled,
  CheckmarkFilled,
  ChevronDown,
  Filter,
  Renew,
  Search,
} from '@carbon/icons-react';
import dayjs from 'dayjs';
import { modulesService } from '../../services/api';
import StatusBadge from '../shared/StatusBadge';
import { PROGRAMS } from '../../utils/constants';

const USER_TABLE_HEADERS = [
  { key: 'moduleName', header: 'Module Name' },
  { key: 'approver', header: 'Approver' },
  { key: 'category', header: 'Category' },
  { key: 'status', header: 'Status' },
  { key: 'publishDate', header: 'Publish Date' },
];

const ADMIN_TABLE_HEADERS = [
  { key: 'moduleName', header: 'Module Name' },
  { key: 'author', header: 'Author' },
  { key: 'category', header: 'Category' },
  { key: 'status', header: 'Status' },
  { key: 'publishDate', header: 'Publish Date' },
];

const USER_TABS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'needsChanges', label: 'Needs Changes' },
  { key: 'approved', label: 'Approved' },
];

const ADMIN_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const submittedStatuses = ['Submitted', 'Pending Review'];

const ReviewQueuePage = ({ role = 'user' }) => {
  const isAdmin = role === 'admin';
  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;
  const tableHeaders = isAdmin ? ADMIN_TABLE_HEADERS : USER_TABLE_HEADERS;
  const [modules, setModules] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(isAdmin ? 'pending' : 'submitted');
  const [programFilter, setProgramFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchReviewQueue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        role,
        status: activeTab,
        ...(programFilter && { program: programFilter }),
        ...(search && { search }),
      };
      const res = await modulesService.getReviewQueue(params);
      setModules(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, programFilter, role, search]);

  useEffect(() => {
    const t = setTimeout(fetchReviewQueue, 300);
    return () => clearTimeout(t);
  }, [fetchReviewQueue]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await modulesService.update(id, { status });
      fetchReviewQueue();
    } catch (err) {
      setError(err.message);
    }
  };

  const rows = modules.map((mod) => ({
    id: mod._id,
    moduleName: mod.moduleName,
    approver: mod.approver || 'Saranya Loganathan',
    author: mod.author,
    category: mod.category || '-',
    status: submittedStatuses.includes(mod.status) ? 'Pending Review' : mod.status,
    publishDate: mod.publishDate ? dayjs(mod.publishDate).format('DD MMM YYYY') : '-',
    _raw: mod,
  }));

  const pendingCount = meta.pendingCount ?? meta.submittedCount ?? 0;
  const submittedCount = meta.submittedCount ?? pendingCount;
  const needsChangesCount = meta.needsChangesCount ?? 0;
  const approvedCount = meta.approvedCount ?? 0;
  const rejectedCount = meta.rejectedCount ?? 0;
  const summaryCount = isAdmin ? pendingCount : (meta.totalUnderReview ?? submittedCount);
  const statsText = isAdmin
    ? `Pending: ${pendingCount} | Approved: ${approvedCount} | Rejected: ${rejectedCount}`
    : `Submitted: ${submittedCount} | Needs Changes: ${needsChangesCount} | Approved: ${approvedCount}`;

  return (
    <div>
      <div className="breadcrumb-bar">
        <Breadcrumb noTrailingSlash>
          <BreadcrumbItem href="#">Bread Crumb</BreadcrumbItem>
          <BreadcrumbItem href="#">Bread Crumb</BreadcrumbItem>
          <BreadcrumbItem href="#">Bread Crumb</BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Modules</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="modules-content">
        <div className="action-bar">
          <h1 className="action-bar__title">Review Queue</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#525252' }}>
              Review Summary<br />
              <span style={{ color: '#161616' }}>
                {summaryCount} modules {isAdmin ? 'awaiting review' : 'under review'}
              </span>
            </span>
            <div className="review-summary">
              <div className="review-count">
                <WarningAltFilled size={20} style={{ color: '#f1c21b' }} />
                <span className="review-count__number">{needsChangesCount}</span>
              </div>
              <div className="review-count">
                <CheckmarkFilled size={20} style={{ color: '#24a148' }} />
                <span className="review-count__number">{approvedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="modules-tabs review-tabs" role="tablist" aria-label="Review queue views">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`modules-tabs__button${activeTab === tab.key ? ' modules-tabs__button--active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <p className="module-counts">
          {statsText}
        </p>

        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            onClose={() => setError('')}
            style={{ marginBottom: '1rem' }}
          />
        )}

        <DataTable rows={rows} headers={tableHeaders} isSortable>
          {({
            rows: tableRows,
            headers,
            getHeaderProps,
            getRowProps,
            getTableProps,
            getTableContainerProps,
            onInputChange,
          }) => (
            <div {...getTableContainerProps()}>
              <div className="modules-table-toolbar">
                <button
                  className="modules-table-toolbar__icon-button"
                  type="button"
                  aria-label="Filter modules"
                >
                  <Filter size={24} />
                </button>

                <label className="modules-table-toolbar__select-wrap" htmlFor="review-program-filter">
                  <select
                    id="review-program-filter"
                    className="modules-table-toolbar__select"
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    aria-label="Program filter"
                  >
                    <option value="">All Programs</option>
                    {PROGRAMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} aria-hidden="true" />
                </label>

                <div className="modules-table-toolbar__search">
                  <Search size={24} aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    placeholder="Find module by name, author or category"
                    onChange={(e) => {
                      setSearch(e.target.value);
                      onInputChange(e);
                    }}
                    aria-label="Search review queue"
                  />
                </div>

                <button
                  className="modules-table-toolbar__icon-button modules-table-toolbar__icon-button--right"
                  type="button"
                  onClick={fetchReviewQueue}
                  aria-label="Refresh modules"
                >
                  <Renew size={24} />
                </button>
              </div>

              <Table {...getTableProps()} size="md">
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                    {isAdmin && <TableHeader />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={headers.length + (isAdmin ? 2 : 1)}>
                        <Loading small description="Loading..." withOverlay={false} />
                      </TableCell>
                    </TableRow>
                  ) : tableRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headers.length + (isAdmin ? 2 : 1)}>
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6f6f6f' }}>
                          No modules in this queue.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableRows.map((row) => {
                      const rawMod = rows.find((r) => r.id === row.id)?._raw;
                      return (
                        <React.Fragment key={row.id}>
                          <TableExpandRow {...getRowProps({ row })}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>
                                {cell.info.header === 'status' ? (
                                  <StatusBadge status={cell.value} />
                                ) : (
                                  cell.value
                                )}
                              </TableCell>
                            ))}
                            {isAdmin && (
                              <TableCell>
                                <OverflowMenu flipped size="sm" iconDescription="Options">
                                  <OverflowMenuItem
                                    itemText="Approve"
                                    onClick={() => handleStatusUpdate(row.id, 'Approved')}
                                  />
                                  <OverflowMenuItem
                                    itemText="Needs Changes"
                                    onClick={() => handleStatusUpdate(row.id, 'Needs Changes')}
                                  />
                                  <OverflowMenuItem
                                    itemText="Reject"
                                    hasDivider
                                    isDelete
                                    onClick={() => handleStatusUpdate(row.id, 'Rejected')}
                                  />
                                </OverflowMenu>
                              </TableCell>
                            )}
                          </TableExpandRow>
                          {row.isExpanded && rawMod && (
                            <TableExpandedRow colSpan={headers.length + (isAdmin ? 2 : 1)}>
                              <div className="expanded-row-content">
                                <p className="expanded-row-content__summary">
                                  {rawMod.summary || 'No summary available.'}
                                </p>
                                {rawMod.serviceComponent && (
                                  <div className="expanded-meta__item" style={{ marginBottom: '0.75rem' }}>
                                    <span className="expanded-meta__label">Service Component</span>
                                    <span className="expanded-meta__value">{rawMod.serviceComponent}</span>
                                  </div>
                                )}
                                {rawMod.tags?.length > 0 && (
                                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                    {rawMod.tags.map((t) => (
                                      <Tag key={t} type="blue" size="sm">{t}</Tag>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableExpandedRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DataTable>
      </div>
    </div>
  );
};

export default ReviewQueuePage;
