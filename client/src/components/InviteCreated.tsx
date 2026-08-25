import React, { useState } from 'react';
import { PulseButton } from './ui/PulseButton';
import { copyToClipboard, openWhatsAppShare } from '../utils/share';

interface InviteCreatedProps {
  inviteCode: string;
  storyTitle?: string;
  onBack: () => void;
}

export const InviteCreated: React.FC<InviteCreatedProps> = ({ inviteCode, storyTitle, onBack }) => {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}?join=${inviteCode}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(inviteUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    openWhatsAppShare(`I started "${storyTitle || 'a story'}" on StoryDuel. Join me and make your choices: ${inviteUrl}`);
  };

  return (
    <div className="screen app-container" style={{ textAlign: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%' }}>
        <div className="orbit-container" style={{ marginBottom: '28px' }}>
          <div className="breathe-ring" />
          <div className="breathe-core" />
        </div>

        <h2 style={{ marginBottom: '8px' }}>{storyTitle || 'Your story'} is waiting.</h2>
        <p className="text-muted" style={{ marginBottom: '32px' }}>
          Send this link to someone. They'll see who you are and step into their half of the story.
        </p>

        <div
          className="invite-code"
          onClick={handleCopy}
          title="Click to copy invite link"
          style={{ marginBottom: '24px' }}
        >
          {inviteUrl.replace(/^https?:\/\//, '')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '32px' }}>
          <PulseButton variant="primary" onClick={handleCopy}>
            {copied ? 'Link copied' : 'Copy link'}
          </PulseButton>

          <PulseButton variant="secondary" onClick={handleWhatsApp}>
            Share to WhatsApp
          </PulseButton>
        </div>

        <div className="waiting-indicator" style={{ justifyContent: 'center', marginBottom: '32px' }}>
          <div className="waiting-dot" />
          <span>Waiting for them to join...</span>
        </div>

        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          ← Cancel and choose a different story
        </button>
      </div>
    </div>
  );
};
