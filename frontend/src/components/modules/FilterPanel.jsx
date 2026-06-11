import React, { useState } from 'react';
import {
  MultiSelect,
  DatePicker,
  DatePickerInput,
  Tag,
} from '@carbon/react';
import { ChevronDown, ChevronRight, Close, Renew } from '@carbon/icons-react';
import { CATEGORIES, AUTHORS, PREDEFINED_TAGS } from '../../utils/constants';

const FilterPanel = ({ filters, onChange, onReset, onClose }) => {
  const [expanded, setExpanded] = useState({
    collaborators: false,
    createdOn: false,
    category: false,
    tags: false,
  });

  const collaboratorItems = AUTHORS.map((name) => ({
    id: name,
    label: name,
    value: name,
  }));

  const categoryItems = CATEGORIES.map((category) => ({
    id: category.value,
    label: category.label,
    value: category.value,
  }));

  const tagItems = PREDEFINED_TAGS.map((tag) => ({
    id: tag,
    label: tag,
    value: tag,
  }));

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleMultiSelect = (group, selectedItems) => {
    const values = selectedItems.map((item) => item.value);
    const nextFilters = { ...filters };

    if (values.length > 0) {
      nextFilters[group] = values.join(',');
    } else {
      delete nextFilters[group];
    }

    onChange(nextFilters);
  };

  const handleDateRange = (dates) => {
    if (dates.length === 2 && dates[0] && dates[1]) {
      const createdTo = new Date(dates[1]);
      createdTo.setHours(23, 59, 59, 999);

      onChange({
        ...filters,
        createdFrom: dates[0]?.toISOString(),
        createdTo: createdTo.toISOString(),
      });
      return;
    }

    const nextFilters = { ...filters };
    delete nextFilters.createdFrom;
    delete nextFilters.createdTo;
    onChange(nextFilters);
  };

  const activeCount = Object.values(filters).filter(
    (v) => Boolean(v)
  ).length;

  const getSelectedValues = (group) => (
    filters[group] ? String(filters[group]).split(',') : []
  );

  return (
    <div className="filter-panel">
      <div className="filter-panel__header">
        <span className="filter-panel__title">
          Filter {activeCount > 0 && <Tag type="blue" size="sm">{activeCount}</Tag>}
        </span>
        <button className="filter-panel__close" type="button" onClick={onClose} aria-label="Close filters">
          <Close size={16} />
        </button>
      </div>

      {/* Collaborators */}
      <div className="filter-section">
        <button
          className="filter-panel__label"
          type="button"
          onClick={() => toggle('collaborators')}
        >
          <span>Collaborators</span>
          {expanded.collaborators ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {expanded.collaborators && (
          <MultiSelect
            id="collaborators-filter"
            titleText=""
            label="Select collaborators"
            placeholder="Choose collaborators"
            items={collaboratorItems}
            itemToString={(item) => item?.label || ''}
            selectedItems={collaboratorItems.filter((item) => getSelectedValues('collaborators').includes(item.value))}
            onChange={({ selectedItems }) => handleMultiSelect('collaborators', selectedItems)}
            size="sm"
            invalidText=""
          />
        )}
      </div>

      {/* Created On */}
      <div className="filter-section">
        <button
          className="filter-panel__label"
          type="button"
          onClick={() => toggle('createdOn')}
        >
          <span>Created on</span>
          {expanded.createdOn ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {expanded.createdOn && (
          <DatePicker
            datePickerType="range"
            dateFormat="d/m/Y"
            onChange={handleDateRange}
          >
            <DatePickerInput
              id="date-from"
              placeholder="dd/mm/yyyy"
              labelText="From"
              size="sm"
            />
            <DatePickerInput
              id="date-to"
              placeholder="dd/mm/yyyy"
              labelText="To"
              size="sm"
            />
          </DatePicker>
        )}
      </div>

      {/* Category */}
      <div className="filter-section">
        <button
          className="filter-panel__label"
          type="button"
          onClick={() => toggle('category')}
        >
          <span>Category</span>
          {expanded.category ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {expanded.category && (
          <MultiSelect
            id="category-filter"
            titleText=""
            label="Select categories"
            placeholder="Choose categories"
            items={categoryItems}
            itemToString={(item) => item?.label || ''}
            selectedItems={categoryItems.filter((item) => getSelectedValues('category').includes(item.value))}
            onChange={({ selectedItems }) => handleMultiSelect('category', selectedItems)}
            size="sm"
            invalidText=""
          />
        )}
      </div>

      {/* Tags */}
      <div className="filter-section">
        <button
          className="filter-panel__label"
          type="button"
          onClick={() => toggle('tags')}
        >
          <span>Tags</span>
          {expanded.tags ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {expanded.tags && (
          <MultiSelect
            id="tags-filter"
            titleText=""
            label="Select tags"
            placeholder="Choose tags"
            items={tagItems}
            itemToString={(item) => item?.label || ''}
            selectedItems={tagItems.filter((item) => getSelectedValues('tags').includes(item.value))}
            onChange={({ selectedItems }) => handleMultiSelect('tags', selectedItems)}
            size="sm"
            invalidText=""
          />
        )}
      </div>

      <button className="filter-panel__reset" type="button" onClick={onReset}>
        <span>Reset Filters</span>
        <Renew size={16} />
      </button>
    </div>
  );
};

export default FilterPanel;
