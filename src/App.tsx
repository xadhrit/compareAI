import React, { useState } from 'react';

/**
 * CSS module 
 */

import './index.css';

const App = ()  => {
  
  const [compareSearch, setCompareSearch] = useState('');

  const handleSubmit = () => {}
  
  return (
    <div className="App">
    <header className='App-header'>
      <h1>CompareAI </h1>
    </header>
    <main className='App-main'>
    <form className="flex flex-row items-center" style={{ maxWidth: '80%', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="elon vs zucc"
          value={compareSearch}
          onChange={(e) => setCompareSearch(e.target.value)}
          className="flex-grow border-2 p-2 rounded-md"
          style={{ maxWidth: '70%', marginTop: '4vh' }}
        />
        <button type="submit" className="flex items-center justify-end bg-black text-white p-2 rounded-md ml-2 w-32" style={{ marginTop: '4vh' }} onClick={handleSubmit}>
          Generate 🪄
          <i className="fas fa-plus ml-2"></i>
        </button>
      </form>

    </main>
    </div>
  );
}

export default App;
