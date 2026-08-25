import React, { useState } from 'react';
import { shareResult } from '../utils/share';

interface ShareCardProps {
  sessionId: string;
  myDisplayName: string;
  partnerName: string;
  storyTitle: string;
  chemistryScore: number;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  sessionId,
  myDisplayName,
  partnerName,
  storyTitle,
  chemistryScore,
}) => {
  const [copied, setCopied] = useState(false);
  const cardSvgUrl = `/api/card/${sessionId}`;
  const shareText = `${myDisplayName} and I just told "${storyTitle}" on StoryDuel without talking. Our story synergy: ${chemistryScore}%. Can you tell it the same way?`;
  const shareUrl = `${window.location.origin}?ref=${sessionId}`;

  const handleShare = async () => {
    const success = await shareResult('StoryDuel', shareText, shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 580;
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
      <div className="eyebrow" style={{ marginBottom: '12px', textAlign: 'center' }}>
        Your story card
      </div>

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
          alt="StoryDuel result card"
          style={{ width: '100%', maxWidth: '320px', height: 'auto', borderRadius: '10px' }}
        />
      </div>

      <div className="share-buttons">
        <button className="share-btn" onClick={handleDownload}>
          Download card
        </button>
        <button className="share-btn" onClick={handleShare}>
          {copied ? 'Link copied' : 'Share the story'}
        </button>
      </div>
    </div>
  );
};
