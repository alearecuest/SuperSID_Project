import React from 'react';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <img src="/logo.png" alt="SuperSID Logo" style={{ width: '150px' }} />
        <h1>Welcome to SuperSID App!</h1>
      </div>
    </div>
  );
};

export default App;