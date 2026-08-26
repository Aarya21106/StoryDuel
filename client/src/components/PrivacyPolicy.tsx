import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="screen app-container" style={{ justifyContent: 'flex-start', maxWidth: '560px' }}>
      <div style={{ width: '100%' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8125rem', marginBottom: '20px', padding: 0 }}
        >
          ← Back
        </button>

        <h2 style={{ marginBottom: '8px' }}>Privacy &amp; Data</h2>

        <div className="glass-card" style={{ marginBottom: '24px', borderColor: 'var(--danger)' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--danger)', fontWeight: 500 }}>
            Draft — not yet reviewed by a lawyer. This page states what the product actually does today;
            it is not a substitute for a properly drafted privacy policy before this app handles real users'
            personal data under India's DPDP Act or any other privacy law.
          </p>
        </div>

        <section style={{ marginBottom: '24px' }}>
          <div className="eyebrow" style={{ marginBottom: '10px' }}>What we collect</div>
          <p className="text-muted" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
            If you sign in with Google, we store your Google account ID, display name, and email, plus the
            stories you play, the choices you make in them, and your session history. Guests are not
            required to sign in — playing as a guest only sends a display name you choose, which we don't
            link to any identity.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <div className="eyebrow" style={{ marginBottom: '10px' }}>How long we keep it</div>
          <p className="text-muted" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Account data and story history are kept until you delete your account from your Profile screen.
            There is currently no automatic expiry beyond that — a real retention period needs to be set and
            stated here before this goes out to real users.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <div className="eyebrow" style={{ marginBottom: '10px' }}>Deleting your data</div>
          <p className="text-muted" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Profile → Delete my account removes your account and strips your name from any story history.
            Because stories are shared with another real player, the story content itself isn't deleted —
            only what identifies you in it.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <div className="eyebrow" style={{ marginBottom: '10px' }}>Content moderation</div>
          <p className="text-muted" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Free-text you write in a story is checked before it's shown to your partner. You can report a
            story from its results screen.
          </p>
        </section>

        <section>
          <div className="eyebrow" style={{ marginBottom: '10px' }}>Grievance contact</div>
          <p className="text-muted" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
            [Placeholder — a named grievance officer and contact email is required here before launch under
            the DPDP Act.]
          </p>
        </section>
      </div>
    </div>
  );
};
