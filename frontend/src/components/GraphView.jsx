import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3-force';

const GraphView = ({ graphData, theme, onNodeClick }) => {
    const fgRef = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [hoverNode, setHoverNode] = useState(null);

    // Responsive sizing
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        window.addEventListener('resize', updateSize);
        updateSize(); // Initial

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // ---------------------------------------------------------
    // CLEAN DATA PROCESSING
    // ---------------------------------------------------------
    const processedData = useMemo(() => {
        if (!graphData?.nodes || !graphData?.links) return { nodes: [], links: [] };

        const isExternal = (id) => {
            if (id.startsWith('IMPORT:')) return !id.startsWith('IMPORT:.') && !id.startsWith('IMPORT:/');
            if (id.includes('node_modules')) return true;
            return false;
        };

        const relevantNodes = graphData.nodes.filter(n => !isExternal(n.id));
        const relevantNodeIds = new Set(relevantNodes.map(n => n.id));

        const relevantLinks = graphData.links.filter(l =>
            relevantNodeIds.has(l.source) && relevantNodeIds.has(l.target)
        );

        const nodes = relevantNodes.map(node => ({ ...node }));
        const links = relevantLinks.map(link => ({ ...link }));

        // Calculate Degrees
        const nodeDegrees = {};
        links.forEach(link => {
            nodeDegrees[link.source] = (nodeDegrees[link.source] || 0) + 1;
            nodeDegrees[link.target] = (nodeDegrees[link.target] || 0) + 1;
        });

        nodes.forEach(node => {
            const isImport = node.id.startsWith('IMPORT:');
            node.isImport = isImport;
            node.shortName = isImport ? node.id.replace('IMPORT:', '') : node.id.split(/[/\\]/).pop();
            node.degree = nodeDegrees[node.id] || 0;
            node.val = Math.min(12, Math.max(4, Math.sqrt(node.degree) * 4));

            if (theme === 'solar') {
                node.color = isImport ? '#2aa198' : '#268bd2';
                node.stroke = '#fdf6e3';
            } else if (theme === 'minimal') {
                node.color = isImport ? '#666' : '#fff';
                node.stroke = '#000';
            } else {
                node.color = isImport ? '#aaddff' : '#4dabf7';
                node.stroke = '#fff';
            }
        });

        return { nodes, links };
    }, [graphData, theme]);

    // ---------------------------------------------------------
    // PHYSICS TUNING
    // ---------------------------------------------------------
    useEffect(() => {
        if (fgRef.current) {
            // 1. Spacing Force
            fgRef.current.d3Force('charge').strength(-1000);

            // 2. Link Force
            fgRef.current.d3Force('link').distance(80);

            // 3. Collision Force (Requires d3-force)
            if (d3) {
                fgRef.current.d3Force('collide', d3.forceCollide().radius(node => node.val + 10).iterations(2));
            }

            fgRef.current.d3ReheatSimulation();
        }
    }, [processedData]);

    const handleNodeHover = node => {
        setHoverNode(node || null);
        const newHighlightNodes = new Set();
        const newHighlightLinks = new Set();

        if (node) {
            newHighlightNodes.add(node.id);
            processedData.links.forEach(link => {
                const sId = typeof link.source === 'object' ? link.source.id : link.source;
                const tId = typeof link.target === 'object' ? link.target.id : link.target;
                if (sId === node.id || tId === node.id) {
                    newHighlightLinks.add(link);
                    newHighlightNodes.add(sId);
                    newHighlightNodes.add(tId);
                }
            });
        }

        setHighlightNodes(newHighlightNodes);
        setHighlightLinks(newHighlightLinks);
    };

    const handleNodeClick = node => {
        if (node && onNodeClick) {
            onNodeClick(node);
        }
    };

    const paintNode = useCallback((node, ctx, globalScale) => {
        const isHovered = node === hoverNode;
        const isHighlighted = highlightNodes.has(node.id);
        const dimmed = hoverNode && !isHighlighted;

        if (dimmed) {
            ctx.globalAlpha = 0.1;
        }

        const label = node.shortName;
        const fontSize = 12 / globalScale;
        // Bold font for better visibility ("Bold White")
        ctx.font = `600 ${fontSize}px Sans-Serif`;

        ctx.fillStyle = node.color;
        ctx.beginPath();
        const r = node.val;
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fill();

        if (!node.isImport) {
            ctx.strokeStyle = node.stroke || '#fff';
            ctx.lineWidth = 1.5 / globalScale;
            ctx.stroke();
        }

        if (node.degree > 1 || isHovered || isHighlighted || globalScale > 1.2) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            if (theme === 'solar') {
                ctx.fillStyle = '#657b83';
            } else {
                ctx.fillStyle = isHovered ? '#fff' : node.color;
            }

            ctx.fillText(label, node.x, node.y + r + 4);
        }

        ctx.globalAlpha = 1;
    }, [hoverNode, highlightNodes, theme]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#1a1a1a', overflow: 'hidden' }}>
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={processedData}

                dagMode="td"
                dagLevelDistance={140}

                onNodeHover={handleNodeHover}
                onNodeClick={handleNodeClick}
                nodeCanvasObject={paintNode}
                nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val + 2, 0, 2 * Math.PI, false);
                    ctx.fill();
                }}

                linkColor={link => {
                    if (highlightLinks.has(link)) return theme === 'solar' ? '#d33682' : '#fff';
                    return theme === 'solar' ? '#93a1a140' : '#ffffff33';
                }}
                linkWidth={link => highlightLinks.has(link) ? 3 : 1}
                linkDirectionalParticles={link => highlightLinks.has(link) ? 4 : 2}
                linkDirectionalParticleWidth={4} // Thicker, bolder particles
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleColor={() => theme === 'solar' ? '#d33682' : '#ffffff'} // Solid White/Magenta

                enableNodeDrag={true}
                backgroundColor="rgba(0,0,0,0)"

                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
            />
        </div>
    );
};

export default GraphView;
