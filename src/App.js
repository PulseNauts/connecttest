// src/App.js
import React, { useState } from 'react';
import getWeb3 from './connectors';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    try {
      console.log('Attempting to connect wallet...');
      const web3Instance = await getWeb3();
      console.log('Web3 instance obtained:', web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      console.log('Connected accounts:', accounts);
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Failed to connect to wallet:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Minting DApp</h1>
        <button onClick={connectWallet}>
          {account ? `Connected: ${account}` : 'Connect Wallet'}
        </button>
      </header>
    </div>
  );
}

export default App;
