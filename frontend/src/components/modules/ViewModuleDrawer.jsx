import React from 'react';
import { Button } from '@carbon/react';
import { Launch } from '@carbon/icons-react';
import SideDrawer from '../shared/SideDrawer';
import StatusBadge from '../shared/StatusBadge';
import dayjs from 'dayjs';

const getGeneratedSummary = (module) => {
  if (module.summary) return module.summary;

  const moduleName = module.moduleName || 'This module';
  const audience = module.targetGroup ? ` for ${module.targetGroup}` : '';
  const category = module.category ? ` in ${module.category}` : '';
  const service = module.serviceComponent ? ` through a ${module.serviceComponent.toLowerCase()} format` : '';

  return `${moduleName} supports learners${audience}${category}${service}. It focuses on guided activities, reflection, and practical takeaways that help participants build awareness and confidence.`;
};

const getGuideNotes = (module) => {
  if (module.notes?.length > 0) {
    return module.notes.map((note) => note.text || note);
  }

  return [
    `Helps participants understand ${module.category || 'the topic'} through guided reflection and practical examples.`,
    `Uses structured activities and discussion prompts to build awareness and confidence.`,
    `Encourages participants to apply the learning in everyday situations with support.`,
  ];
};

const ViewModuleDrawer = ({ open, onClose, module, onEdit, onDuplicate }) => {
  if (!module) return null;

  const publishDate = module.publishDate
    ? dayjs(module.publishDate).format('DD MMM YYYY')
    : '-';
  const guideNotes = getGuideNotes(module);

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={module.moduleName}
      size="sm"
      className="module-view-drawer"
      bodyClassName="module-view-drawer__body"
      compact
      footerContent={(
        <div className="module-view-drawer__footer">
          <Button kind="primary" renderIcon={Launch} onClick={onEdit}>
            Open Module Editor
          </Button>
          <button className="module-view-drawer__duplicate" type="button" onClick={onDuplicate}>
            Duplicate module
          </button>
        </div>
      )}
    >
      <div>
        <section className="module-view-drawer__summary">
          <div className="module-view-drawer__section-title module-view-drawer__section-title--with-ai">
            <span>Summary</span>
            <span className="ai-pill">AI</span>
          </div>
          <p className="module-view-drawer__summary-text">
            {getGeneratedSummary(module)}
          </p>
        </section>

        <details className="module-view-drawer__accordion">
          <summary>Module</summary>
          <div className="module-view-drawer__accordion-content">
            <p>{module.serviceComponent || 'Module details will appear here.'}</p>
          </div>
        </details>

        <details className="module-view-drawer__accordion" open>
          <summary>Facilitator guide</summary>
          <div className="module-view-drawer__accordion-content">
            <ul>
              {guideNotes.map((note, i) => (
                <li key={`${note}-${i}`}>{note}</li>
              ))}
            </ul>
          </div>
        </details>

        <section className="module-view-drawer__overview">
          <h3>Overview</h3>
          <div className="module-view-drawer__meta">
            <div>
              <span>Publish Date</span>
              <strong>{publishDate}</strong>
            </div>
            <div>
              <span>Author</span>
              <strong>{module.author || '-'}</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>{module.category || '-'}</strong>
            </div>
            <div>
              <span>Status</span>
              <StatusBadge status={module.status} />
            </div>
          </div>
        </section>
      </div>
    </SideDrawer>
  );
};

export default ViewModuleDrawer;
