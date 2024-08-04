import React, { useEffect, useState } from 'react';
import getWeb3 from './connectors';
import './App.css';
import abi from './config/abi.json';
import contractConfig from './config/contract.json';

const CONFIG = {
  CONTRACT_ADDRESS: contractConfig.address,
  SCAN_LINK: `https://scan.pulsechain.com/address/${contractConfig.address}`,
  NETWORK: {
    NAME: "PulseChain",
    SYMBOL: "PLS",
    ID: 369,
  },
  NFT_NAME: "Baby Ape Pulse Club",
  SYMBOL: "BAPC",
  MAX_SUPPLY: 5555,
  WEI_COST: 0,
  GAS_LIMIT: 500000,
  SHOW_BACKGROUND: false,
};

function App() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [mintAmount, setMintAmount] = useState(1);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [totalSupply, setTotalSupply] = useState(0);

  const fetchTotalSupply = async (contractInstance) => {
    try {
      const supply = await contractInstance.methods.totalSupply().call();
      console.log('Total supply:', supply);
      setTotalSupply(Number(supply)); // Convert BigInt to number
    } catch (error) {
      console.error('Failed to fetch total supply:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const web3Instance = await getWeb3();
        const contractInstance = new web3Instance.eth.Contract(abi, CONFIG.CONTRACT_ADDRESS);
        setWeb3(web3Instance);
        setContract(contractInstance);
        fetchTotalSupply(contractInstance); // Fetch total supply on initial load
      } catch (error) {
        console.error('Failed to initialize web3 or contract:', error);
      }
    };

    init();
  }, []);

  const connectWallet = async () => {
    try {
      console.log('Attempting to connect wallet...');
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected accounts:', accounts);
        setAccount(accounts[0]);
        fetchTotalSupply(contract); // Fetch total supply after connecting wallet
      } else {
        console.error('MetaMask is not installed.');
        setFeedback('Please install MetaMask to connect your wallet.');
      }
    } catch (error) {
      console.error('Failed to connect to wallet:', error);
      setFeedback('Failed to connect to wallet.');
    }
  };

  const claimNFTs = async () => {
    if (web3 && account && contract) {
      setClaimingNft(true);
      setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
      const cost = CONFIG.WEI_COST;
      const gasLimit = CONFIG.GAS_LIMIT;
      const totalCostWei = String(cost * mintAmount);
      const totalGasLimit = String(gasLimit * mintAmount);
      console.log('Cost: ', totalCostWei);
      console.log('Gas limit: ', totalGasLimit);

      try {
        const receipt = await contract.methods
          .mint(mintAmount)
          .send({
            gasLimit: totalGasLimit,
            to: CONFIG.CONTRACT_ADDRESS,
            from: account,
            value: totalCostWei,
          });

        console.log('Receipt: ', receipt);
        setFeedback(`Successfully minted your ${CONFIG.NFT_NAME}!`);
        setClaimingNft(false);
        fetchTotalSupply(contract); // Fetch total supply after minting
      } catch (error) {
        console.error('Error minting NFT: ', error);
        setFeedback('Sorry, something went wrong. Please try again later.');
        setClaimingNft(false);
      }
    }
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  return (
    <div className="Screen">
      <div className="Container" style={{ padding: 24, backgroundColor: '#ADACE6' }}>
        <div className="ResponsiveWrapper" style={{ padding: 24 }}>
          <div className="Container" style={{ backgroundColor: '#00b7c3', borderRadius: '24px', flex: 2, justifyContent: 'center', alignItems: 'center' }}>
            <p className="TextTitle" style={{ textAlign: "center", fontSize: 48, fontWeight: "bold", color: "var(--accent-text2)", textShadow: "4px 4px 8px rgba(0, 0, 0, .8)" }}>
              Baby Ape Pulse Club
            </p>
            <div className="SpacerSmall" />
            <p className="TextTitle" style={{ textAlign: "center", fontSize: 36, fontWeight: "", color: "var(--secondary-text)", textShadow: "4px 4px 8px rgba(0, 0, 0, .8)" }}>
              {totalSupply} / {CONFIG.MAX_SUPPLY}
            </p>
            <div className="SpacerLarge" />
            <p className="TextDescription" style={{ textAlign: "center", color: "var(--secondary-text)", textShadow: "4px 4px 8px rgba(0, 0, 0, .8)" }}>
              Mint your exclusive Baby Ape Pulse Club NFT on PulseChain!
            </p>
            <div className="SpacerSmall" />
            {Number(totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <div className="SpacerSmall" />
                <p className="TextTitle" style={{ textAlign: "center", color: "var(--accent-text)" }}>
                  The sale has ended.
                </p>
                <p className="TextDescription" style={{ textAlign: "center", color: "var(--accent-text)" }}>
                  You can still find {CONFIG.NFT_NAME} on {CONFIG.MARKETPLACE}
                </p>
                <div className="SpacerSmall" />
                <button className="StyledButton" onClick={() => window.open(CONFIG.MARKETPLACE_LINK, "_blank")}>
                  {CONFIG.MARKETPLACE}
                </button>
              </>
            ) : (
              <>
                <div className="SpacerXSmall" />
                <div className="SpacerSmall" />
                {account === null ? (
                  <div className="Container" style={{ alignItems: "center", justifyContent: "center" }}>
                    <button className="StyledButton" onClick={connectWallet}>
                      <img src="/images/connect.png" alt="Connect Wallet" />
                    </button>
                    {feedback !== "" && (
                      <>
                        <div className="SpacerSmall" />
                        <p className="TextDescription" style={{ textAlign: "center", color: "var(--accent-text)" }}>
                          {feedback}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="TextDescription" style={{ textAlign: "center", color: "var(--accent-text)" }}>
                      {feedback}
                    </p>
                    <div className="SpacerMedium" />
                    <div className="Container" style={{ alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                      <button className="StyledRoundButton" style={{ lineHeight: 0.4 }} disabled={claimingNft ? 1 : 0} onClick={(e) => {
                        e.preventDefault();
                        decrementMintAmount();
                      }}>
                        -
                      </button>
                      <div className="SpacerMedium" />
                      <p className="TextDescription" style={{ textAlign: "center", color: "var(--accent-text)" }}>
                        {mintAmount}
                      </p>
                      <div className="SpacerMedium" />
                      <button className="StyledRoundButton" disabled={claimingNft ? 1 : 0} onClick={(e) => {
                        e.preventDefault();
                        incrementMintAmount();
                      }}>
                        +
                      </button>
                    </div>
                    <div className="SpacerSmall" />
                    <div className="Container" style={{ alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                      <button className="StyledButton" disabled={claimingNft ? 1 : 0} onClick={(e) => {
                        e.preventDefault();
                        claimNFTs();
                      }}>
                        <img src={claimingNft ? "/images/busy.png" : "/images/buy.png"} alt={claimingNft ? "Busy" : "Buy"} />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
            <div className="SpacerMedium" />
          </div>
          <div className="SpacerLarge" />
          <div className="Container" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <img className="StyledImg" alt={"example"} src={"/images/example.gif"} />
          </div>
        </div>
        <div className="SpacerMedium" />
        <div className="Container" style={{ justifyContent: "center", alignItems: "center", width: "70%" }}>
          <div className="ContentBox">
            <p className="TextTitle" style={{ textAlign: "center", color: "var(--accent-text2)", textShadow: "4px 4px 8px rgba(0, 0, 0, .8)", fontSize: "36px" }}>
              About the Baby Ape Pulse Club
            </p>
            <p className="TextDescription" style={{ textAlign: "center", color: "var(--secondary-text)", textShadow: "4px 4px 8px rgba(0, 0, 0, .8)" }}>
              The Baby Ape Pulse Club (BAPC) is an NFT collection on PulseChain. These NFTs are a free drop for all Pulse Ape Yacht Club (PAYC) holders, with a limit of 20 NFTs per wallet/holder. You only need to cover the gas fees.
            </p>
          </div>
          <div className="ContentBox">
            <p className="TextTitle" style={{ textAlign: "center", color: "var(--accent-text2)", fontSize: "36px", textShadow: "4px 4px 8px rgba(0, 0, 0, .8)" }}>
              How to Mint
            </p>
            <p className="TextDescription" style={{ textAlign: "center", color: "var(--secondary-text)", textShadow: "4px 4px 8px rgba(0, 0, 0, .8)" }}>
              Connect your wallet, select the number of NFTs you want to mint (up to 20 per wallet), and click the mint button. Ensure you have enough PLS to cover the gas fees. Enjoy your exclusive Baby Ape Pulse Club NFTs!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
