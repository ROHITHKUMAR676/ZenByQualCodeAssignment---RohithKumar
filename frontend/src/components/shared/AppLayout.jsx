import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Header,
  SkipToContent,
} from '@carbon/react';
import {
  Close,
  Document,
  Help,
  Menu,
  Search,
  Notification,
  Review,
  UserAvatar,
} from '@carbon/icons-react';

const AppLayout = ({ children, currentRole, onRoleChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRoleChange = (event) => {
    const nextRole = event.target.value;
    onRoleChange(nextRole);
    navigate(nextRole === 'admin' ? '/admin/review-queue' : '/modules', { replace: true });
    setMenuOpen(false);
  };

  const goTo = (path, role = currentRole) => {
    if (role !== currentRole) {
      onRoleChange(role);
    }
    navigate(path);
    setMenuOpen(false);
  };

  const isAdminPath = location.pathname.startsWith('/admin');
  const activePath = location.pathname;

  return (
    <>
      <Header aria-label="Self Talk Psychologist" className="app-header">
        <SkipToContent />
        <div className="app-header__brand">
          <button
            className="app-header__menu"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={24} />
          </button>
          <a className="app-header__name" href="#">Self Talk Psychologist</a>
        </div>

        <div className="app-header__search">
          <input
            placeholder="Search resources and products"
            aria-label="Search resources and products"
          />
          <Search size={24} />
        </div>

        <nav className="app-header__nav" aria-label="Main navigation">
          <a href="#">Catalog</a>
          <a href="#">Select Campus</a>
          <a href="#">Dr. B Ramesh</a>
        </nav>

        <div className="app-header__actions">
          <button type="button" aria-label="Search">
            <Search size={24} />
          </button>
          <button type="button" aria-label="Help">
            <Help size={24} />
          </button>
          <button type="button" aria-label="Notifications">
            <Notification size={24} />
          </button>
          <div className="role-switcher">
            <UserAvatar size={24} />
            <select
              aria-label="Switch role"
              value={currentRole}
              onChange={handleRoleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <span className="role-switcher__status">
              {isAdminPath ? 'Admin view' : 'User view'}
            </span>
          </div>
        </div>
      </Header>

      {menuOpen && (
        <button
          className="app-menu-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`app-menu${menuOpen ? ' app-menu--open' : ''}`} aria-hidden={!menuOpen}>
        <div className="app-menu__header">
          <div>
            <p className="app-menu__eyebrow">Workspace</p>
            <h2 className="app-menu__title">Self Talk Psychologist</h2>
          </div>
          <button className="app-menu__close" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <Close size={20} />
          </button>
        </div>

        <div className="app-menu__profile">
          <UserAvatar size={28} />
          <div>
            <p className="app-menu__profile-name">Dr. B Ramesh</p>
            <p className="app-menu__profile-role">{currentRole === 'admin' ? 'Admin view' : 'User view'}</p>
          </div>
        </div>

        <nav className="app-menu__nav" aria-label="Menu navigation">
          <button
            className={`app-menu__item${activePath === '/modules' ? ' app-menu__item--active' : ''}`}
            type="button"
            onClick={() => goTo('/modules', 'user')}
          >
            <Document size={20} />
            <span>
              <strong>Modules</strong>
              <small>Create, browse, and edit your learning modules</small>
            </span>
          </button>
          <button
            className={`app-menu__item${activePath === '/review-queue' ? ' app-menu__item--active' : ''}`}
            type="button"
            onClick={() => goTo('/review-queue', 'user')}
          >
            <Review size={20} />
            <span>
              <strong>My Review Queue</strong>
              <small>Track submitted modules and requested changes</small>
            </span>
          </button>
          <button
            className={`app-menu__item${activePath === '/admin/review-queue' ? ' app-menu__item--active' : ''}`}
            type="button"
            onClick={() => goTo('/admin/review-queue', 'admin')}
          >
            <Review size={20} />
            <span>
              <strong>Admin Review</strong>
              <small>Approve, request changes, or reject modules</small>
            </span>
          </button>
        </nav>

        <div className="app-menu__footer">
          <label htmlFor="menu-role-select">Role</label>
          <select id="menu-role-select" value={currentRole} onChange={handleRoleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </aside>

      <main style={{ marginTop: '56px', minHeight: 'calc(100vh - 56px)' }}>
        {children}
      </main>
    </>
  );
};

export default AppLayout;
