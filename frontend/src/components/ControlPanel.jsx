import React, { useState } from 'react';

const ControlPanel = ({ onIngest, theme, setTheme }) => {
    const [repoUrl, setRepoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (repoUrl.trim()) {
            setIsLoading(true);
            // Simulate brief delay for UI feel or await actual ingest if async
            await onIngest(repoUrl);
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: '24px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)' // Consistent font
        }}>
            {/* Header Section */}
            <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--glass-border)' }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '32px',
                    letterSpacing: '-1px',
                    background: 'linear-gradient(90deg, var(--primary) 0%, #aaddff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: theme === 'solar' ? 'var(--primary)' : 'transparent',
                    textShadow: theme === 'solar' ? 'none' : '0 0 20px var(--primary-glow)'
                }}>
                    VibeCraft
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)', opacity: 0.8 }}>
                    Codebase Visualization Engine
                </p>
            </div>

            {/* Main Action Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                    TARGET REPOSITORY
                </label>

                <div style={{ position: 'relative', width: '100%' }}>
                    <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="github.com/username/repo"
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'rgba(0,0,0,0.15)', // Sits well on both dark/light
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary)';
                            e.target.style.background = 'rgba(0,0,0,0.25)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--glass-border)';
                            e.target.style.background = 'rgba(0,0,0,0.15)';
                        }}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'var(--primary)',
                        color: theme === 'minimal' || theme === 'solar' ? '#fff' : '#000',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '700',
                        letterSpacing: '1px',
                        cursor: isLoading ? 'wait' : 'pointer',
                        opacity: isLoading ? 0.7 : 1,
                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 15px var(--primary-glow)',
                        textTransform: 'uppercase'
                    }}
                    onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    {isLoading ? 'ANALYZING...' : 'INITIATE VISUALIZATION'}
                </button>
            </div>

            {/* Theme Selector */}
            <div style={{ marginTop: 'auto' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                    INTERFACE THEME
                </label>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.1)',
                    padding: '4px',
                    borderRadius: '10px'
                }}>
                    {['cyberpunk', 'minimal', 'solar'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            style={{
                                padding: '8px 0',
                                background: theme === t ? 'var(--glass-border)' : 'transparent',
                                color: theme === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: '1px solid',
                                borderColor: theme === t ? 'var(--primary)' : 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                opacity: 0.6,
                paddingTop: '10px',
                borderTop: '1px solid var(--glass-border)'
            }}>
                VibeCraft Systems v2.0
            </div>
        </div>
    );
};

export default ControlPanel;
