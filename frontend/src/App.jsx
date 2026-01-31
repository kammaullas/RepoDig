import React, { useState } from 'react';
import axios from 'axios';
import GraphView from './components/GraphView';
import ControlPanel from './components/ControlPanel';
import NodeDetailsPanel from './components/NodeDetailsPanel';
import './App.css'; // Ensure we can style the body

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState('solar');
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  // Cloud API URL with local fallback
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleIngest = async (repoUrl) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ingest`, { repoUrl });

      if (response.status === 200) {
        console.log("Ingestion successful, fetching graph...");
        await fetchGraph();
      } else {
        alert("Ingestion started but not confirmed finished.");
      }
    } catch (error) {
      console.error('Ingest failed:', error);
      alert('Ingestion failed: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchGraph = async () => {
    try {
      const res = await axios.get(`${API_URL}/graph`);
      setGraphData(res.data);
    } catch (error) {
      console.error('Fetch graph failed:', error);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  return (
    <div className="App" data-theme={theme}>
      {/* Background Graph Layer */}
      <div className="graph-container">
        {loading ?
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'var(--primary)',
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            letterSpacing: '4px',
            textShadow: '0 0 15px var(--primary-glow)',
            background: 'var(--bg-dark)'
          }}>
            SYSTEM INITIALIZING...
          </div>
          : <GraphView graphData={graphData} theme={theme} onNodeClick={handleNodeClick} />
        }
      </div>

      {/* Floating UI Overlay */}
      {showSidebar ? (
        <div className="ui-overlay">
          <button
            onClick={() => setShowSidebar(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '0 5px',
              alignSelf: 'flex-end' // Align button to the right within the flex container
            }}
          >
            —
          </button>

          <ControlPanel onIngest={handleIngest} currentTheme={theme} setTheme={setTheme} />
        </div>
      ) : (
        <button
          onClick={() => setShowSidebar(true)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 100,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--primary)',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontFamily: 'var(--font-display)',
            fontWeight: 'bold'
          }}
        >
          Show Menu
        </button>
      )}

      {/* Node Details Panel */}
      {selectedNode && (
        <NodeDetailsPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          theme={theme}
        />
      )}
    </div>
  );
}

export default App;
