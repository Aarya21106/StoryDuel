import React, { useState } from 'react';
import { PulseButton } from './ui/PulseButton';

interface AgeGateModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ onConfirm, onCancel }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="objective-overlay">
      <div style={{ maxWidth: '360px', width: '100%', textAlign: 'left' }}>
        <div className="eyebrow" style={{ marginBottom: '16px', textAlign: 'center' }}>One more thing</div>
        <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>Before your account is created</h2>

        <p className="text-muted" style={{ fontSize: '0.9375rem', marginBottom: '20px', lineHeight: 1.55 }}>
          StoryDuel involves open-ended, sometimes mature story writing with other real people, including strangers.
          You need to be old enough to use it.
        </p>

        <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '28px' }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{ marginTop: '3px' }}
          />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-cream)' }}>
            I confirm I am 18 or older, or old enough in my country to use a platform like this with a
            parent or guardian's permission.
          </span>
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PulseButton variant="primary" onClick={onConfirm} disabled={!checked}>
            Confirm and create account
          </PulseButton>
          <PulseButton variant="ghost" onClick={onCancel}>
            Cancel
          </PulseButton>
        </div>
      </div>
    </div>
  );
};
