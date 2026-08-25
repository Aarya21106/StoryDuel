import React, { useState } from 'react';
import { PulseButton } from './ui/PulseButton';
import { copyToClipboard, shareResult } from '../utils/share';

interface ShareCardProps {
  sessionId: string;
  myDisplayName: string;
  partnerName: string;
  chemistryScore: number;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  sessionId,
  myDisplayName,
  partnerName,
  chemistryScore,
}) => {
  const [copied, setCopied] = useState(false);
  const cardSvgUrl = `/api/card/${sessionId}`;
  const shareText = `We created a story on StoryDuel without talking! Our Story Chemistry is ${chemistryScore}%. Can you beat our score?`;
  const shareUrl = `${window.location.origin}?ref=${sessionId}`;

  const handleShare = async () => {
    const success = await shareResult('StoryDuel Result', shareText, shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    // Create an image from SVG and draw to Canvas for PNG download
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 560;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.download = `StoryDuel-${myDisplayName}-${partnerName}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };
    img.src = cardSvgUrl;
  };

  return (
    <div style={{ width: '100%', marginBottom: '36px' }}>
      <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'center' }}>
        STORYDUEL SHARE CARD
      </div>

      {/* Embedded SVG Preview */}
      <div
        className="glass-card"
        style={{
          padding: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '16px',
          overflow: 'hidden',
        }}
      >
        <img
          src={cardSvgUrl}
          alt="StoryDuel Result Card"
          style={{ width: '100%', maxWidth: '320px', height: 'auto', borderRadius: '12px' }}
        />
      </div>

      {/* Share Actions */}
      <div className="share-buttons">
        <button className="share-btn" onClick={handleDownload}>
          📥 Download PNG
        </button>
        <button className="share-btn" onClick={handleShare}>
          {copied ? '✓ Link Copied' : '📤 Share Result'}
        </button>
      </div>
    </div>
  );
};
