import React, { useState, useEffect } from 'react';
import { configService } from '../services/config.service';
import { configObserverService } from '../services/config-observer.service';

const ConfigDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState({
    localStorageKey: '',
    observatoryId: 0,
    fullConfig: {} as any,
    timestamp: '',
  });

  const handleRefresh = () => {
    const id = configService.getObservatoryId();
    const config = configService.getConfig();
    const stored = localStorage.getItem('supersid-config');

    console.log('🔍 DEBUG - Observatory ID:', id);
    console.log('🔍 DEBUG - Full Config:', config);
    console.log('🔍 DEBUG - localStorage:', stored);

    setDebugInfo({
      localStorageKey: stored || 'NO DATA',
      observatoryId: id,
      fullConfig: config,
      timestamp: new Date().toISOString(),
    });
  };

  const handleTestSave = () => {
    console.log('💾 TEST - Saving Observatory ID: 999');
    configService.saveConfig({ observatoryId: 999 }).then(() => {
      console.log('✅ TEST - Saved!');
      setTimeout(handleRefresh, 100);
    });
  };

  useEffect(() => {
    handleRefresh();

    // Suscribirse a cambios
    const unsubscribe = configObserverService.subscribe(() => {
      console.log('🔔 DEBUG - Config changed detected!');
      handleRefresh();
    });

    return unsubscribe;
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#1a1a1a',
      color: '#00ff00',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '400px',
      zIndex: 9999,
      border: '2px solid #00ff00',
      maxHeight: '300px',
      overflowY: 'auto',
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        🐛 CONFIG DEBUG
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Observatory ID:</strong> {debugInfo.observatoryId}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Timestamp:</strong> {debugInfo.timestamp}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>localStorage:</strong>
        <pre style={{ fontSize: '10px', margin: '5px 0' }}>
          {debugInfo.localStorageKey.substring(0, 200)}...
        </pre>
      </div>

      <div style={{ marginBottom: '8px', display: 'flex', gap: '5px' }}>
        <button
          onClick={handleRefresh}
          style={{
            padding: '5px 10px',
            background: '#00ff00',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          🔄 Refresh
        </button>
        <button
          onClick={handleTestSave}
          style={{
            padding: '5px 10px',
            background: '#ff6600',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          💾 Test Save 999
        </button>
      </div>
    </div>
  );
};

export default ConfigDebug;