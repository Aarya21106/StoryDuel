import React, { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../../config';

interface GoogleSignInProps {
  onCredential: (credential: string) => void;
}

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({ onCredential }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;
    let attempts = 0;

    const tryRender = () => {
      if (cancelled) return;
      const g = (window as any).google;
      if (!g?.accounts?.id) {
        if (attempts++ < 50) setTimeout(tryRender, 100);
        return;
      }
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (resp: { credential: string }) => onCredential(resp.credential),
      });
      if (ref.current) {
        ref.current.innerHTML = '';
        g.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
        });
      }
    };

    tryRender();
    return () => { cancelled = true; };
  }, [onCredential]);

  if (!GOOGLE_CLIENT_ID) return null;
  return <div ref={ref} />;
};
