'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';

// ─── CONFIG ─────────────────────────────────────────────────────────────────

const FEEDBACK_ENDPOINT = '/api/feedback';

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug', emoji: '\u{1F41B}' },
  { value: 'ui', label: 'UI Issue', emoji: '\u{1F3A8}' },
  { value: 'suggestion', label: 'Suggestion', emoji: '\u{1F4A1}' },
  { value: 'question', label: 'Question', emoji: '\u2753' },
] as const;

// ─── Styles ─────────────────────────────────────────────────────────────────

const fabStyle: CSSProperties = {
  position: 'fixed',
  bottom: '16px',
  left: '16px',
  zIndex: 9998,
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#1a1a2e',
  color: '#fff',
  border: '2px solid #333',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontFamily: 'monospace',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  transition: 'transform 0.15s ease',
};

const panelStyle: CSSProperties = {
  position: 'fixed',
  bottom: '64px',
  left: '16px',
  zIndex: 9998,
  width: '320px',
  backgroundColor: '#1a1a2e',
  borderRadius: '12px',
  border: '1px solid #333',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--gap-sm, 6px)',
  fontFamily: 'var(--font-family-body, system-ui)',
};

const headerStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const typeRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '6px',
};

const typeBtnStyle = (active: boolean): CSSProperties => ({
  flex: 1,
  padding: '6px 4px',
  borderRadius: '6px',
  border: active ? '1px solid #666' : '1px solid #333',
  backgroundColor: active ? '#2a2a3e' : 'transparent',
  color: active ? '#e0e0e0' : '#888',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: active ? 600 : 400,
  textAlign: 'center',
  transition: 'all 0.1s ease',
});

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '80px',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #333',
  backgroundColor: '#111',
  color: '#e0e0e0',
  fontSize: '13px',
  fontFamily: 'var(--font-family-body, system-ui)',
  resize: 'vertical',
  outline: 'none',
  boxSizing: 'border-box',
};

const contextStyle: CSSProperties = {
  fontSize: '10px',
  color: '#666',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const submitBtnStyle = (disabled: boolean): CSSProperties => ({
  padding: '8px 16px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: disabled ? '#333' : '#27ae60',
  color: disabled ? '#666' : '#fff',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  transition: 'background-color 0.1s ease',
});

const successStyle: CSSProperties = {
  textAlign: 'center',
  color: '#27ae60',
  fontSize: '13px',
  fontWeight: 600,
  padding: '20px 0',
};

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Feedback widget for Storybook — posts to Notion via .storybook/middleware.js.
 * Renders as a floating action button in the bottom-left of the preview iframe.
 */
export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>('bug');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Derive the current story context from the URL hash
  const getStoryContext = () => {
    try {
      // Storybook iframe URL contains the story id in the query string
      const params = new URLSearchParams(window.location.search);
      return params.get('id') ?? window.location.pathname;
    } catch {
      return window.location.pathname;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);

    try {
      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_url: getStoryContext(),
          feedback_type: type,
          description: description.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setOpen(false);
          setSubmitted(false);
          setDescription('');
          setType('bug');
        }, 1500);
      } else {
        const data = await res.json();
        console.error('Feedback submission failed:', data);
        alert(`Feedback failed: ${data.error ?? 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Feedback submission failed:', err);
      alert('Feedback failed — check the console.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        style={fabStyle}
        onClick={() => setOpen(!open)}
        aria-label="Submit feedback"
        title="Submit Feedback"
      >
        {'\u{1F4AC}'}
      </button>

      {open && (
        <div style={panelStyle}>
          <div style={headerStyle}>Submit Feedback</div>

          {submitted ? (
            <div style={successStyle}>Submitted — thank you!</div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm, 6px)' }}>
              {/* Type selector */}
              <div style={typeRowStyle}>
                {FEEDBACK_TYPES.map((ft) => (
                  <button
                    key={ft.value}
                    type="button"
                    style={typeBtnStyle(type === ft.value)}
                    onClick={() => setType(ft.value)}
                  >
                    {ft.emoji} {ft.label}
                  </button>
                ))}
              </div>

              {/* Description */}
              <textarea
                style={textareaStyle}
                placeholder="Describe what you found..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />

              {/* Auto-captured story context */}
              <div style={contextStyle}>
                Story: {typeof window !== 'undefined' ? getStoryContext() : ''}
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={submitBtnStyle(submitting || !description.trim())}
                disabled={submitting || !description.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
