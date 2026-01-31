import React from 'react';

const NodeDetailsPanel = ({ node, onClose, theme }) => {
    if (!node) return null;

    // Extract file information
    const fileName = node.shortName || node.id;
    const fullPath = node.id.startsWith('IMPORT:') ? node.id.replace('IMPORT:', '') : node.id;
    const fileExtension = fileName.split('.').pop();
    const isImport = node.isImport;
    const degree = node.degree || 0;

    // Get file type description
    const getFileType = (ext) => {
        const types = {
            'js': 'JavaScript',
            'jsx': 'React Component',
            'ts': 'TypeScript',
            'tsx': 'TypeScript React',
            'css': 'Stylesheet',
            'json': 'Configuration',
            'md': 'Documentation',
            'html': 'HTML Document',
            'py': 'Python',
            'java': 'Java',
            'go': 'Go',
            'rs': 'Rust',
            'cpp': 'C++',
            'c': 'C',
            'rb': 'Ruby'
        };
        return types[ext] || 'File';
    };

    // Get connection description
    const getConnectionLevel = (degree) => {
        if (degree === 0) return { level: 'Isolated', color: '#94a3b8', description: 'No connections' };
        if (degree <= 2) return { level: 'Low', color: '#10b981', description: 'Few dependencies' };
        if (degree <= 5) return { level: 'Medium', color: '#f59e0b', description: 'Moderate coupling' };
        if (degree <= 10) return { level: 'High', color: '#f97316', description: 'Many dependencies' };
        return { level: 'Critical', color: '#ef4444', description: 'Highly connected hub' };
    };

    const connectionInfo = getConnectionLevel(degree);

    // Generate impact analysis based on connections and file type
    const getImpactAnalysis = (degree, fileType, isImport) => {
        if (isImport) {
            return {
                title: '📦 External Dependency',
                description: 'This is an external package. Removing it would require finding alternative implementations or removing features that depend on it.',
                severity: 'medium'
            };
        }

        if (degree === 0) {
            return {
                title: '✅ Safe to Remove',
                description: 'This file has no connections to other parts of the project. It can likely be deleted without breaking anything.',
                severity: 'low'
            };
        }

        if (degree <= 2) {
            return {
                title: '⚠️ Minor Impact',
                description: `Removing this file would affect ${degree} other ${degree === 1 ? 'file' : 'files'}. The impact would be localized and relatively easy to refactor.`,
                severity: 'low'
            };
        }

        if (degree <= 5) {
            return {
                title: '⚠️ Moderate Impact',
                description: `This file is connected to ${degree} other files. Deleting it would require refactoring multiple components. Consider extracting shared logic before removal.`,
                severity: 'medium'
            };
        }

        if (degree <= 10) {
            return {
                title: '🚨 High Impact',
                description: `This is a key file with ${degree} dependencies. Removing it would cause widespread breakage across the project. Major refactoring would be needed.`,
                severity: 'high'
            };
        }

        return {
            title: '🔥 Critical Hub',
            description: `This file is a central hub with ${degree} connections. Deleting it would likely break the entire application. This is core infrastructure that many parts of the system rely on.`,
            severity: 'critical'
        };
    };

    const impactAnalysis = getImpactAnalysis(degree, getFileType(fileExtension), isImport);

    // Get severity color
    const getSeverityColor = (severity) => {
        const colors = {
            'low': '#10b981',
            'medium': '#f59e0b',
            'high': '#f97316',
            'critical': '#ef4444'
        };
        return colors[severity] || '#94a3b8';
    };

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 15,
            width: '350px',
            maxWidth: '90vw',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            padding: '24px',
            borderRadius: '20px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'var(--font-display)'
        }}>
            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '24px',
                    padding: '4px 8px',
                    lineHeight: '1',
                    transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
                ×
            </button>

            {/* Header */}
            <div style={{ marginBottom: '20px', paddingRight: '30px' }}>
                <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.5px',
                    marginBottom: '8px'
                }}>
                    {isImport ? 'EXTERNAL IMPORT' : 'PROJECT FILE'}
                </div>
                <h2 style={{
                    margin: 0,
                    fontSize: '18px',
                    color: 'var(--text-primary)',
                    wordBreak: 'break-word',
                    lineHeight: '1.4'
                }}>
                    {fileName}
                </h2>
            </div>

            {/* File Type Badge */}
            <div style={{
                display: 'inline-block',
                padding: '6px 12px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--primary)',
                marginBottom: '20px'
            }}>
                {getFileType(fileExtension)}
            </div>

            {/* Divider */}
            <div style={{
                height: '1px',
                background: 'var(--glass-border)',
                margin: '20px 0'
            }} />

            {/* Details Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Full Path */}
                <div>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        marginBottom: '6px',
                        letterSpacing: '0.5px'
                    }}>
                        FILE PATH
                    </div>
                    <div style={{
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        background: 'rgba(0,0,0,0.15)',
                        padding: '10px',
                        borderRadius: '8px',
                        lineHeight: '1.5'
                    }}>
                        {fullPath}
                    </div>
                </div>

                {/* Connection Info */}
                <div>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        marginBottom: '6px',
                        letterSpacing: '0.5px'
                    }}>
                        DEPENDENCY LEVEL
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: connectionInfo.color,
                            boxShadow: `0 0 10px ${connectionInfo.color}`
                        }} />
                        <div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: connectionInfo.color
                            }}>
                                {connectionInfo.level}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)'
                            }}>
                                {connectionInfo.description}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Connection Count */}
                <div>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        marginBottom: '6px',
                        letterSpacing: '0.5px'
                    }}>
                        TOTAL CONNECTIONS
                    </div>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        fontFamily: 'var(--font-display)'
                    }}>
                        {degree}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginTop: '4px'
                    }}>
                        {degree === 1 ? 'dependency' : 'dependencies'}
                    </div>
                </div>

                {/* Node Size */}
                <div>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        marginBottom: '6px',
                        letterSpacing: '0.5px'
                    }}>
                        NODE IMPORTANCE
                    </div>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.min(100, (degree / 15) * 100)}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, var(--primary), ${connectionInfo.color})`,
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        marginTop: '6px'
                    }}>
                        Based on connection count and graph position
                    </div>
                </div>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    background: 'var(--glass-border)',
                    margin: '8px 0'
                }} />

                {/* Impact Analysis */}
                <div>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        marginBottom: '10px',
                        letterSpacing: '0.5px'
                    }}>
                        IMPACT ANALYSIS
                    </div>
                    <div style={{
                        padding: '16px',
                        background: `linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.1))`,
                        border: `1px solid ${getSeverityColor(impactAnalysis.severity)}40`,
                        borderLeft: `4px solid ${getSeverityColor(impactAnalysis.severity)}`,
                        borderRadius: '12px',
                        marginBottom: '8px'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: getSeverityColor(impactAnalysis.severity),
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            {impactAnalysis.title}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-primary)',
                            lineHeight: '1.6',
                            opacity: 0.9
                        }}>
                            {impactAnalysis.description}
                        </div>
                    </div>
                    <div style={{
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic'
                    }}>
                        What would happen if this file didn't exist?
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div style={{
                marginTop: '24px',
                padding: '12px',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '8px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
            }}>
                💡 <strong>Tip:</strong> Hover over this node in the graph to see its immediate connections highlighted.
            </div>

            {/* Animation Keyframes */}
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default NodeDetailsPanel;
