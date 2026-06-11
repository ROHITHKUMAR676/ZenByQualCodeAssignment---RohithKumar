import React from 'react';
import {
  Header,
  SkipToContent,
} from '@carbon/react';
import {
  Help,
  Menu,
  Search,
  Notification,
  UserAvatar,
} from '@carbon/icons-react';

const AppLayout = ({ children }) => {
  return (
    <>
      <Header aria-label="Self Talk Psychologist" className="app-header">
        <SkipToContent />
        <div className="app-header__brand">
          <button className="app-header__menu" type="button" aria-label="Open menu">
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
          <button type="button" aria-label="User profile">
            <UserAvatar size={24} />
          </button>
        </div>
      </Header>

      <main style={{ marginTop: '56px', minHeight: 'calc(100vh - 56px)' }}>
        {children}
      </main>
    </>
  );
};

export default AppLayout;
