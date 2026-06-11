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
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  Select,
  SelectItem,
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
  Renew,
} from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { modulesService } from '../../services/api';
import StatusBadge from '../shared/StatusBadge';
import { PROGRAMS } from '../../utils/constants';

const TABLE_HEADERS = [
  { key: 'moduleName', header: 'Module Name' },
  { key: 'approver', header: 'Approver' },
  { key: 'category', header: 'Category' },
  { key: 'status', header: 'Status' },
  { key: 'publishDate', header: 'Publish Date' },
];

const TABS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'needsChanges', label: 'Needs Changes' },
  { key: 'approved', label: 'Approved' },
];

const ReviewQueuePage = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('submitted');
  const [programFilter, setProgramFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchReviewQueue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
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
  }, [activeTab, programFilter, search]);

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
    approver: mod.author,
    category: mod.category || '-',
    status: mod.status,
    publishDate: mod.publishDate ? dayjs(mod.publishDate).format('DD MMM YYYY') : '-',
    _raw: mod,
  }));

  const needsChangesCount = meta.needsChangesCount ?? 0;
  const approvedCount = meta.approvedCount ?? 0;

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
              <span style={{ color: '#161616' }}>{meta.totalUnderReview ?? 0} modules under review</span>
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

        {/* Stats */}
        <p style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '1rem' }}>
          Submitted: {meta.submittedCount ?? 0} | Needs Changes: {needsChangesCount} | Approved: {approvedCount}
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '0' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.625rem 1rem',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #0f62fe' : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#0f62fe' : '#525252',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            onClose={() => setError('')}
            style={{ marginBottom: '1rem' }}
          />
        )}

        <DataTable rows={rows} headers={TABLE_HEADERS} isSortable>
          {({
            rows: tableRows,
            headers,
            getHeaderProps,
            getRowProps,
            getTableProps,
            getToolbarProps,
            getTableContainerProps,
            onInputChange,
          }) => (
            <div {...getTableContainerProps()}>
              <TableToolbar {...getToolbarProps()}>
                <TableToolbarContent>
                  <Select
                    id="review-program-filter"
                    labelText=""
                    hideLabel
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    style={{ minWidth: '160px' }}
                    size="sm"
                  >
                    <SelectItem value="" text="All Programs" />
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p.value} value={p.value} text={p.label} />
                    ))}
                  </Select>

                  <TableToolbarSearch
                    placeholder="Find module by name, author or category"
                    onChange={(e) => {
                      setSearch(e.target.value);
                      onInputChange(e);
                    }}
                    value={search}
                    persistent
                  />

                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Renew}
                    iconDescription="Refresh"
                    hasIconOnly
                    onClick={fetchReviewQueue}
                  />
                </TableToolbarContent>
              </TableToolbar>

              <Table {...getTableProps()} size="md">
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={headers.length + 2}>
                        <Loading small description="Loading..." withOverlay={false} />
                      </TableCell>
                    </TableRow>
                  ) : tableRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headers.length + 2}>
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
                          </TableExpandRow>
                          {row.isExpanded && rawMod && (
                            <TableExpandedRow colSpan={headers.length + 2}>
                              <div className="expanded-row-content">
                                <p className="expanded-row-content__summary">
                                  {rawMod.summary || 'No summary available.'}
                                </p>
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
