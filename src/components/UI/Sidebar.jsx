import React from 'react';
import {
  Home, Calendar, Bookmark, Heart, Grid3X3,
  Sparkles, ChevronDown, Compass
} from 'lucide-react';
import './Sidebar.css';

const NAV_LINKS = [
  { href: '#/explore', icon: <Home size={18} />, label: 'Explore',      key: 'explore' },
  { href: '#/itinerary', icon: <Calendar size={18} />, label: 'Itinerary', key: 'itinerary' },
  { href: '#/bucket-list', icon: <Bookmark size={18} />, label: 'Bucket List', key: 'bucket-list' },
  { href: '#/saved', icon: <Heart size={18} />, label: 'Saved Places', key: 'saved' },
  { href: '#/boards', icon: <Grid3X3 size={18} />, label: 'Boards',     key: 'boards' },
];

function Sidebar({ activePage = 'explore', onNavigate }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-compass-icon">
          <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
            <path
              d="M13 1 L14.5 11.5 L25 13 L14.5 14.5 L13 25 L11.5 14.5 L2 13 L11.5 11.5 Z"
              fill="white" opacity="0.85"
            />
          </svg>
        </div>
        <span className="sidebar-wordmark">ATLAS IQ</span>
      </div>

      {/* Nav Links */}
      <nav className="sidebar-nav">
        {NAV_LINKS.map(({ href, icon, label, key }) => (
          <a
            key={key}
            href={href}
            className={`sidebar-nav-link ${activePage === key ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onNavigate?.(key); }}
          >
            {icon}
            <span>{label}</span>
          </a>
        ))}
      </nav>

      {/* AI Assistant Teaser */}
      <div className="ai-assistant-card">
        <div className="ai-card-header">
          <Sparkles size={16} className="ai-sparkle" />
          <h4 className="ai-card-title">AI Travel Assistant</h4>
        </div>
        <p className="ai-card-body">
          Get personalized recommendations for your next adventure.
        </p>
        <button className="ai-ask-btn">Ask Atlas IQ</button>
      </div>

      {/* User Row */}
      <div className="sidebar-user-row">
        <div className="sidebar-avatar">M</div>
        <span className="sidebar-username">Mika</span>
        <span className="sidebar-pro-badge">Pro</span>
        <ChevronDown size={14} className="sidebar-chevron" />
      </div>
    </aside>
  );
}

export default Sidebar;
