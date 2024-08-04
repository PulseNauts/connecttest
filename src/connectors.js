import Web3 from 'web3';

const PULSECHAIN_RPC_URL = 'https://rpc.pulsechain.com';

const getWeb3 = async () => {
  console.log('Checking for Ethereum provider...');
  
  if (window.ethereum) {
    console.log('Ethereum provider detected.');
    const web3 = new Web3(window.ethereum);
    try {
      console.log('Attempting to add PulseChain network...');
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x171', // 369 in hexadecimal
          chainName: 'PulseChain',
          nativeCurrency: {
            name: 'Pulse',
            symbol: 'PLS',
            decimals: 18
          },
          rpcUrls: [PULSECHAIN_RPC_URL],
          blockExplorerUrls: ['https://scan.pulsechain.com']
        }]
      });
      console.log('PulseChain network added successfully.');
      console.log('Attempting to request account access...');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Account access granted.');
      return web3;
    } catch (error) {
      console.error('Error during network addition or account access:', error);
      throw error;
    }
  } else if (window.web3) {
    console.log('Legacy web3 provider detected.');
    const web3 = new Web3(window.web3.currentProvider);
    return web3;
  } else {
    console.log('No web3 provider detected, using HTTP provider.');
    const web3 = new Web3(new Web3.providers.HttpProvider(PULSECHAIN_RPC_URL));
    return web3;
  }
};

export default getWeb3;
