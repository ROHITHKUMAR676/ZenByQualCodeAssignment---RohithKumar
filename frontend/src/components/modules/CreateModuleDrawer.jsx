import React, { useState, useEffect } from 'react';
import {
  TextInput,
  Select,
  SelectItem,
  TextArea,
  Tag,
  InlineNotification,
} from '@carbon/react';
import { Ai } from '@carbon/icons-react';
import SideDrawer from '../shared/SideDrawer';
import { modulesService } from '../../services/api';
import {
  PROGRAMS,
  CATEGORIES,
  TARGET_GROUPS,
  SERVICE_COMPONENTS,
  PREDEFINED_TAGS,
} from '../../utils/constants';

const defaultForm = {
  moduleName: '',
  author: 'Dr. B Ramesh',
  program: '',
  category: '',
  targetGroup: '',
  serviceComponent: '',
  summary: '',
  tags: ['Mental Health'],
};

const CreateModuleDrawer = ({ open, onClose, onSuccess, editData }) => {
  const [form, setForm] = useState(defaultForm);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState(false);

  const isEdit = Boolean(editData);

  useEffect(() => {
    if (editData) {
      setForm({
        moduleName: editData.moduleName || '',
        author: editData.author || 'Dr. B Ramesh',
        program: editData.program || '',
        category: editData.category || '',
        targetGroup: editData.targetGroup || '',
        serviceComponent: editData.serviceComponent || '',
        summary: editData.summary || '',
        tags: editData.tags || [],
      });
    } else {
      setForm(defaultForm);
    }
    setError('');
    setNameError(false);
  }, [editData, open]);

  const handleChange = (field) => (e) => {
    const value = e.target?.value ?? e;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'moduleName') setNameError(false);
  };

  const addTag = (tag) => {
    const t = tag || tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, t] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async (action) => {
    if (!form.moduleName.trim()) {
      setNameError(true);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await modulesService.update(editData._id, form);
      } else {
        await modulesService.create({ ...form, action });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Module' : 'Add Modules'}
      subtitle={
        isEdit
          ? 'Update module details, content, and configuration settings.'
          : 'Create a new module with its details, content, and configuration settings.'
      }
      size="md"
      secondaryAction={{
        label: isEdit ? 'Save Changes' : 'Save Draft',
        onClick: () => handleSubmit('draft'),
        loading,
      }}
      primaryAction={{
        label: isEdit ? 'Update Module' : 'Create and Submit',
        onClick: () => handleSubmit(isEdit ? 'draft' : 'submit'),
        loading,
        disabled: !form.moduleName.trim(),
      }}
    >
      <div style={{ padding: '1.5rem' }}>
        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            style={{ marginBottom: '1rem' }}
            onClose={() => setError('')}
          />
        )}

        <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#161616' }}>
          Details
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="moduleName"
            labelText="Module Name"
            placeholder="Module Name"
            value={form.moduleName}
            onChange={handleChange('moduleName')}
            invalid={nameError}
            invalidText="Module Name is required"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <Select
            id="program"
            labelText="Program"
            value={form.program}
            onChange={handleChange('program')}
          >
            <SelectItem value="" text="Select Program" />
            {PROGRAMS.map((p) => (
              <SelectItem key={p.value} value={p.value} text={p.label} />
            ))}
          </Select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <Select
            id="category"
            labelText="Category"
            value={form.category}
            onChange={handleChange('category')}
          >
            <SelectItem value="" text="Select Category" />
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value} text={c.label} />
            ))}
          </Select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <Select
            id="targetGroup"
            labelText="Target group"
            value={form.targetGroup}
            onChange={handleChange('targetGroup')}
          >
            <SelectItem value="" text="Select a group" />
            {TARGET_GROUPS.map((g) => (
              <SelectItem key={g.value} value={g.value} text={g.label} />
            ))}
          </Select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <Select
            id="serviceComponent"
            labelText="Service Component"
            value={form.serviceComponent}
            onChange={handleChange('serviceComponent')}
          >
            <SelectItem value="" text="Service Component" />
            {SERVICE_COMPONENTS.map((s) => (
              <SelectItem key={s.value} value={s.value} text={s.label} />
            ))}
          </Select>
        </div>

        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <TextArea
            id="summary"
            labelText={
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Quick Summary</span>
                <span style={{ color: '#6f6f6f', fontWeight: 400 }}>
                  {form.summary.length}/100
                </span>
              </span>
            }
            placeholder="Add a short overview of the module purpose"
            value={form.summary}
            onChange={handleChange('summary')}
            rows={3}
            maxLength={100}
          />
          <Ai
            size={16}
            style={{
              position: 'absolute',
              right: '8px',
              bottom: '28px',
              color: '#6f6f6f',
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6f6f6f', marginTop: '0.25rem' }}>
            Add a rough idea. AI can refine it.
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#525252' }}>
            Tags (Optional)
          </p>
          <div
            style={{
              border: '1px solid #8d8d8d',
              borderRadius: '2px',
              padding: '0.5rem',
              minHeight: '2.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.25rem',
              alignItems: 'center',
            }}
          >
            {form.tags.map((tag) => (
              <Tag
                key={tag}
                type="blue"
                size="sm"
                filter
                onClose={() => removeTag(tag)}
              >
                {tag}
              </Tag>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder={form.tags.length === 0 ? 'Add tags...' : ''}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '0.875rem',
                flex: 1,
                minWidth: '80px',
                background: 'transparent',
              }}
            />
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {PREDEFINED_TAGS.filter((t) => !form.tags.includes(t)).slice(0, 6).map((tag) => (
              <span
                key={tag}
                onClick={() => addTag(tag)}
                style={{
                  display: 'inline-block',
                  padding: '0.125rem 0.5rem',
                  background: '#e0e0e0',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                + {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};

export default CreateModuleDrawer;
