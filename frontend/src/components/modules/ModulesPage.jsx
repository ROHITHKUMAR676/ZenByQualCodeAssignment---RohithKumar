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
  Button,
  Breadcrumb,
  BreadcrumbItem,
  Tag,
  Loading,
  InlineNotification,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { Add, ChevronDown, Filter, Renew, Search } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { modulesService } from '../../services/api';
import StatusBadge from '../shared/StatusBadge';
import CreateModuleDrawer from './CreateModuleDrawer';
import ViewModuleDrawer from './ViewModuleDrawer';
import FilterPanel from './FilterPanel';
import { PROGRAMS } from '../../utils/constants';

const TABLE_HEADERS = [
  { key: 'moduleName', header: 'Module Name' },
  { key: 'author', header: 'Author' },
  { key: 'serviceComponent', header: 'Service Component' },
  { key: 'program', header: 'Program' },
  { key: 'status', header: 'Status' },
  { key: 'publishDate', header: 'Publish Date' },
];

const CURRENT_USER = 'Dr. B Ramesh';

const getGeneratedSummary = (mod) => {
  if (mod.summary) return mod.summary;

  const moduleName = mod.moduleName || 'This module';
  const audience = mod.targetGroup ? ` for ${mod.targetGroup}` : '';
  const category = mod.category ? ` in ${mod.category}` : '';
  const service = mod.serviceComponent ? ` through a ${mod.serviceComponent.toLowerCase()} format` : '';

  return `${moduleName} supports learners${audience}${category}${service}. It focuses on guided activities, reflection, and practical takeaways that help participants build awareness and confidence.`;
};

const ModulesPage = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [meta, setMeta] = useState({ liveCount: 0, draftCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState('all');

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...(search && { search }),
        ...(programFilter && { program: programFilter }),
        ...(activeView === 'my' && { collaborators: CURRENT_USER }),
        ...filters,
      };
      const res = await modulesService.getAll(params);
      setModules(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, programFilter, activeView, filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchModules, 300);
    return () => clearTimeout(timeout);
  }, [fetchModules]);

  const handleViewModule = async (moduleId) => {
    try {
      const res = await modulesService.getById(moduleId);
      setSelectedModule(res.data);
      setViewDrawerOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditModule = (mod) => {
    setSelectedModule(mod);
    setViewDrawerOpen(false);
    setEditDrawerOpen(true);
  };

  const handleDuplicateModule = async (mod) => {
    if (!mod) return;

    const duplicatePayload = {
      moduleName: `${mod.moduleName} Copy`,
      author: mod.author || CURRENT_USER,
      program: mod.program || '',
      category: mod.category || '',
      targetGroup: mod.targetGroup || '',
      serviceComponent: mod.serviceComponent || '',
      summary: mod.summary || '',
      tags: mod.tags || [],
      notes: mod.notes || [],
      collaborators: mod.collaborators || [],
      action: 'draft',
    };

    try {
      const res = await modulesService.create(duplicatePayload);
      await fetchModules();
      setSelectedModule(res.data);
      setViewDrawerOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const rows = modules.map((mod) => ({
    id: mod._id,
    moduleName: mod.moduleName,
    author: mod.author,
    serviceComponent: mod.serviceComponent || '-',
    program: mod.program || '-',
    status: mod.status,
    publishDate: mod.publishDate ? dayjs(mod.publishDate).format('DD MMM YYYY') : '-',
    _raw: mod,
  }));

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <Breadcrumb noTrailingSlash>
          <BreadcrumbItem href="#">Bread Crumb</BreadcrumbItem>
          <BreadcrumbItem href="#">Bread Crumb</BreadcrumbItem>
          <BreadcrumbItem href="#">Bread Crumb</BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Modules</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="modules-layout">
        {/* Main Content */}
        <div className="modules-content">
          <div className="action-bar">
            <h1 className="action-bar__title">Modules</h1>
            <div className="action-bar__right">
              <Button
                kind="secondary"
                onClick={() => navigate('/review-queue')}
              >
                Review Queue
              </Button>
              <Button
                kind="primary"
                renderIcon={Add}
                onClick={() => setCreateDrawerOpen(true)}
              >
                Create Modules
              </Button>
            </div>
          </div>

          <div className="modules-tabs" role="tablist" aria-label="Module views">
            {[
              { key: 'all', label: 'All Modules' },
              { key: 'my', label: 'My Modules' },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`modules-tabs__button${activeView === tab.key ? ' modules-tabs__button--active' : ''}`}
                type="button"
                role="tab"
                aria-selected={activeView === tab.key}
                onClick={() => setActiveView(tab.key)}
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

          <p className="module-counts">
            Live Modules: {meta.liveCount} | Draft modules: {meta.draftCount}
          </p>

          {/* DataTable */}
          <DataTable rows={rows} headers={TABLE_HEADERS} isSortable>
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
                    onClick={() => setShowFilters((v) => !v)}
                    aria-label="Toggle filters"
                  >
                    <Filter size={24} />
                  </button>

                  <label className="modules-table-toolbar__select-wrap" htmlFor="program-filter">
                    <select
                      id="program-filter"
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
                      aria-label="Search modules"
                    />
                  </div>

                  <button
                    className="modules-table-toolbar__icon-button modules-table-toolbar__icon-button--right"
                    type="button"
                    onClick={fetchModules}
                    aria-label="Refresh modules"
                  >
                    <Renew size={24} />
                  </button>
                </div>

                <div className="modules-table-area">
                  {showFilters && (
                    <FilterPanel
                      filters={filters}
                      onChange={setFilters}
                      onReset={() => setFilters({})}
                      onClose={() => setShowFilters(false)}
                    />
                  )}

                  <div className="modules-table-area__table">
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
                              <Loading small description="Loading modules..." withOverlay={false} />
                            </TableCell>
                          </TableRow>
                        ) : tableRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={headers.length + 2}>
                              <div style={{ textAlign: 'center', padding: '2rem', color: '#6f6f6f' }}>
                                No modules found. Create your first module!
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
                                      {cell.info.header === 'moduleName' ? (
                                        <button
                                          className="module-name-link"
                                          type="button"
                                          onClick={() => handleViewModule(row.id)}
                                        >
                                          {cell.value}
                                        </button>
                                      ) : cell.info.header === 'status' ? (
                                        <StatusBadge status={cell.value} />
                                      ) : (
                                        cell.value
                                      )}
                                    </TableCell>
                                  ))}
                                  <TableCell>
                                    <OverflowMenu flipped size="sm" iconDescription="Options">
                                      <OverflowMenuItem
                                        itemText="View"
                                        onClick={() => handleViewModule(row.id)}
                                      />
                                      <OverflowMenuItem
                                        itemText="Edit"
                                        onClick={() => rawMod && handleEditModule(rawMod)}
                                      />
                                      <OverflowMenuItem
                                        itemText="Submit for Review"
                                        onClick={async () => {
                                          await modulesService.update(row.id, { status: 'Submitted' });
                                          fetchModules();
                                        }}
                                      />
                                    </OverflowMenu>
                                  </TableCell>
                                </TableExpandRow>

                                {row.isExpanded && rawMod && (
                                  <TableExpandedRow colSpan={headers.length + 2}>
                                    <div className="expanded-row-content">
                                      <div className="generated-summary">
                                        <div className="generated-summary__main">
                                          <div className="generated-summary__title">
                                            <span>Generated Summary</span>
                                            <span className="ai-pill">AI</span>
                                          </div>
                                          <p className="generated-summary__text">
                                            {getGeneratedSummary(rawMod)}
                                          </p>
                                        </div>
                                        <div className="expanded-meta">
                                          <div className="expanded-meta__item">
                                            <span className="expanded-meta__label">Category</span>
                                            <span className="expanded-meta__value">{rawMod.category || '-'}</span>
                                          </div>
                                          <div className="expanded-meta__item">
                                            <span className="expanded-meta__label">Target Group</span>
                                            <span className="expanded-meta__value">{rawMod.targetGroup || '-'}</span>
                                          </div>
                                        </div>
                                        <div className="generated-summary__tags">
                                          {rawMod.tags?.length > 0 ? (
                                            <>
                                              {rawMod.tags.slice(0, 2).map((t) => (
                                                <Tag key={t} type="blue" size="sm">{t}</Tag>
                                              ))}
                                              {rawMod.tags.length > 2 && (
                                                <Tag type="blue" size="sm">+{rawMod.tags.length - 2}</Tag>
                                              )}
                                            </>
                                          ) : (
                                            <span className="expanded-meta__value">-</span>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        kind="ghost"
                                        size="sm"
                                        style={{ marginTop: '0.75rem' }}
                                        onClick={() => rawMod && handleEditModule(rawMod)}
                                      >
                                        Open Module Editor
                                      </Button>
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
                </div>

                <div className="modules-mobile-list" aria-label="Modules list">
                  {loading ? (
                    <div className="modules-mobile-state">
                      <Loading small description="Loading modules..." withOverlay={false} />
                    </div>
                  ) : modules.length === 0 ? (
                    <div className="modules-mobile-state">
                      No modules found. Create your first module!
                    </div>
                  ) : (
                    modules.map((mod) => (
                      <button
                        key={mod._id}
                        className="module-card"
                        type="button"
                        onClick={() => handleViewModule(mod._id)}
                      >
                        <span className="module-card__topline">
                          <span>{mod.program || 'No program'}</span>
                          <StatusBadge status={mod.status} />
                        </span>
                        <span className="module-card__title">{mod.moduleName}</span>
                        <span className="module-card__summary">
                          {getGeneratedSummary(mod)}
                        </span>
                        <span className="module-card__meta">
                          <span>{mod.author || '-'}</span>
                          <span>{mod.program || '-'}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </DataTable>
        </div>
      </div>

      {/* Create Drawer */}
      <CreateModuleDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSuccess={fetchModules}
      />

      {/* Edit Drawer */}
      <CreateModuleDrawer
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        onSuccess={fetchModules}
        editData={selectedModule}
      />

      {/* View Drawer */}
      <ViewModuleDrawer
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        module={selectedModule}
        onEdit={() => selectedModule && handleEditModule(selectedModule)}
        onDuplicate={() => handleDuplicateModule(selectedModule)}
      />
    </div>
  );
};

export default ModulesPage;
