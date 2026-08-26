import React from 'react';

interface FooterProps {
  onAdminClick?: () => void;
  onPrivacyClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick, onPrivacyClick }) => {
  return (
    <footer className="app-footer">
      <span>13+</span>
      <span>·</span>
      <a
        href="#privacy"
        onClick={(e) => {
          e.preventDefault();
          if (onPrivacyClick) onPrivacyClick();
          else alert('Privacy: StoryDuel collects no personal information beyond session display names. All story text is ephemeral.');
        }}
      >
        Privacy
      </a>
      <span>·</span>
      <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms: By participating, you grant StoryDuel permission to display your co-created stories and results.'); }}>
        Terms
      </a>
      <span>·</span>
      <a href="#safety" onClick={(e) => { e.preventDefault(); alert('Safety: Direct stranger chat is disabled. Free-form text is moderated for hate speech and inappropriate content.'); }}>
        Safety
      </a>
      {onAdminClick && (
        <>
          <span>·</span>
          <button
            onClick={onAdminClick}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: 'inherit',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Admin
          </button>
        </>
      )}
    </footer>
  );
};
