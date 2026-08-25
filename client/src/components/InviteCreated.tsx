import React, { useState } from 'react';
import { PulseButton } from './ui/PulseButton';
import { copyToClipboard, openWhatsAppShare } from '../utils/share';

interface InviteCreatedProps {
  inviteCode: string;
  onBack: () => void;
}

export const InviteCreated: React.FC<InviteCreatedProps> = ({ inviteCode, onBack }) => {
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
    openWhatsAppShare(`I started a story on StoryDuel. Join me here to make your choices: ${inviteUrl}`);
  };

  return (
    <div className="screen app-container" style={{ textAlign: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%' }}>
        <h2 style={{ marginBottom: '12px' }}>Your story is waiting.</h2>
        <p className="text-muted" style={{ marginBottom: '32px' }}>
          Send this link to someone:
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
            {copied ? '✓ COPIED LINK' : '📋 COPY LINK'}
          </PulseButton>

          <PulseButton variant="secondary" onClick={handleWhatsApp}>
            💬 SHARE TO WHATSAPP
          </PulseButton>
        </div>

        <div className="waiting-indicator" style={{ justifyContent: 'center', marginBottom: '32px' }}>
          <div className="waiting-dot" />
          <span>Waiting for them to join...</span>
        </div>

        <button
          className="btn-ghost"
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          ← Cancel and return home
        </button>
      </div>
    </div>
  );
};
