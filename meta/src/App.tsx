import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers';
import erc20DemoJson from './artifacts/contracts/ERC20Demo.sol/ERC20Demo.json';
import {useWallet,  ConnectButton} from '@suiet/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction, TransactionData, TransactionResult } from '@mysten/sui/transactions';
import { Keypair } from '@mysten/sui/cryptography';
import { spawn } from 'child_process';

// --- Ethereum Contract Address ---
const ethContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// --- Sui Package Details
const SUI_PACKAGE_ID = '0x199497ec21848b15a78ae536c9f42d37c54511b23ec71ead809414c63a5749d';
const SUI_MODULE_NAME = 'ibt_token';
const suiMintFunction = 'mint';
const suiBurnFunction = 'burn';
const suiTreasuryCapId = '0x31f785bcf9bb12b67b807083fa82252999db25995af55fcd171eb35d9d5e0f0c';
const INACCESSIBLE_ADDRESS = '0x02c34bee7bc8d90f22da8469b05e714e6b41395d3f47d5f3c4491041fd19e315';

const suiClient = new SuiClient({
  url: getFullnodeUrl('localnet'),
});

function App() {

  const { connected, connect, account, signAndExecuteTransactionBlock } = useWallet();

  // ----------------------
  // Ethereum State
  // ----------------------
  const [ethUserAddress, setEthUserAddress] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>('0');  
  const [ethAmountToMint, setEthAmountToMint] = useState('1000');
  const [ethAmountToBurn, setEthAmountToBurn] = useState('500');
  const [ethStatus, setEthStatus] = useState('');

  // ----------------------
  // SUI State
  // ----------------------
  const [suiUserAddress, setSuiUserAddress] = useState<string | null>(null);
  const [suiBalance, setSuiBalance] = useState<string>('0');
  const [suiAmountToMint, setSuiAmountToMint] = useState('1000');
  const [suiAmountToBurn, setSuiAmountToBurn] = useState('500');
  const [suiStatus, setSuiStatus] = useState('');

  // ----------------------
  // Ethereum Methods
  // ----------------------

  // 1. Connect to MetaMask (Ethereum)
  const connectEthWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install it.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setEthUserAddress(accounts[0]);
    } catch (error: any) {
      console.error(error);
      setEthStatus("Failed to connect Ethereum wallet.");
    }
  };

  // 2. Fetch Ethereum IBT Balance from the contract
  const fetchEthBalance = async (address: string) => {
    if (!window.ethereum) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(ethContractAddress, erc20DemoJson.abi, provider);
      const balanceResult = await contract.balanceOf(address);
      setEthBalance(formatEther(balanceResult)); // Convert from wei to human-readable
    } catch (err) {
      console.error("Error fetching Ethereum token balance:", err);
    }
  };

  // 3. Mint Ethereum-based IBT tokens (must be called by the owner)
  const handleEthMint = async () => {
    if (!ethUserAddress || !window.ethereum) return;
    try {
      setEthStatus("Minting...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(ethContractAddress, erc20DemoJson.abi, signer);

      const tx = await contract.mint(ethUserAddress, parseEther(ethAmountToMint));
      await tx.wait();

      setEthStatus(`Minted ${ethAmountToMint} IBT tokens successfully (on Ethereum)!`);
      fetchEthBalance(ethUserAddress);
    } catch (err: any) {
      console.error(err);
      setEthStatus(`Mint failed: ${err.message}`);
    }
  };

  // 4. Burn Ethereum-based IBT tokens (any holder can burn)
  const handleEthBurn = async () => {
    if (!ethUserAddress || !window.ethereum) return;
    try {
      setEthStatus("Burning...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(ethContractAddress, erc20DemoJson.abi, signer);

      const tx = await contract.burn(parseEther(ethAmountToBurn));
      await tx.wait();

      setEthStatus(`Burned ${ethAmountToBurn} IBT tokens successfully (on Ethereum)!`);
      fetchEthBalance(ethUserAddress);
    } catch (err: any) {
      console.error(err);
      setEthStatus(`Burn failed: ${err.message}`);
    }
  };

  // ----------------------
  // Sui Methods (UI Only, Not Implemented)
  // ----------------------


 // ----------------------
  // 1. Connect to Sui Wallet
  // ----------------------
  const connectSuiWallet = async () => {
    try {
      const client = new SuiClient({
        url: getFullnodeUrl('localnet'),
      });
  
      const address = '0xb8e8a182e386483ad2afc86a85716a88f54a726957a4c06bf77bd9c158e8610b';
      const { data } = await client.getCoins({
        owner: address,
        coinType: '0x199497ec21848b15a78ae536c9f42d37c54511b23ec71ead809414c63a5749d::ibt_token::IBT_TOKEN',
      });
  
      setSuiUserAddress(address);
  
      if (data.length === 0) {
        setSuiStatus('No IBT_TOKENs found in the wallet.');
        setSuiBalance('0');
        return;
      }
  
      var totalBalance = data.reduce((acc, coin) => acc + parseFloat(coin.balance) / 1_000_000, 0);
      setSuiBalance(totalBalance.toString());

      
      setSuiStatus('Connected to SUI wallet. IBT_TOKEN balance updated.');
    } catch (error) {
      console.error('Error fetching coin balances:', error);
      setSuiStatus('Failed to connect to SUI wallet.');
    }
  };
  
  const fetchSuiBalance = async (address) => {
    try {
      const client = new SuiClient({
        url: getFullnodeUrl('localnet'),
      });
      const { data } = await client.getCoins({
        owner: address,
        coinType: '0x199497ec21848b15a78ae536c9f42d37c54511b23ec71ead809414c63a5749d::ibt_token::IBT_TOKEN',
      });
  
      if (data.length === 0) {
        setSuiStatus('No IBT_TOKENs found in the wallet.');
        setSuiBalance('0');
        return;
      }
  
      const totalBalance = data.reduce((acc, coin) => acc + BigInt(coin.balance), BigInt(0));
  
      setSuiBalance(totalBalance.toString());
      setSuiStatus('Fetched IBT_TOKEN balance successfully.');
    } catch (error) {
      console.error('Error fetching coin balances:', error);
      setSuiStatus('Failed to fetch coin balances.');
    }
  };
  
  async function handleSuiMint() {
    setSuiStatus('Minting...');
  
    const client = new SuiClient({
      url: getFullnodeUrl('localnet'),
    });
  
    const keypair = Ed25519Keypair.fromSecretKey('suiprivkey1qzhqe986lkq2g754suedd48lzvmw0gn5x692le9q6z30ez5nfkyqu9t444q');
  
    const packageId = '0x199497ec21848b15a78ae536c9f42d37c54511b23ec71ead809414c63a5749d';
    const moduleName = 'ibt_token';
    const functionName = 'mint';
    const recipient = '0xb8e8a182e386483ad2afc86a85716a88f54a726957a4c06bf77bd9c158e8610b';
    const amount = 2000000;
    const address = '0xb8e8a182e386483ad2afc86a85716a88f54a726957a4c06bf77bd9c158e8610b';
  
    const tx = new Transaction();
    tx.setGasBudget(3_000_000);
  
    tx.moveCall({
      target: `0x199497ec21848b15a78ae536c9f42d37c54511b23ec71ead809414c63a5749d::ibt_token::mint`,
      typeArguments: [],
      arguments: [
        tx.object('0xb73b8a9c74ef78f34d954e09cdf3b5e492f716d94ce0052af200d86eb3437322'),
        tx.pure.string(suiAmountToMint), 
        tx.pure.string('0xb8e8a182e386483ad2afc86a85716a88f54a726957a4c06bf77bd9c158e8610b'),
      ],
    });
  
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });
  
    await client.waitForTransaction({ digest: result.digest });  
    setSuiStatus(`Minted ${amount} IBT_TOKEN successfully!`);

    connectSuiWallet();
  }

  // Burn IBT on SUI
  const handleSuiBurn = async () => {
    setSuiStatus('Minting...');
  
    const client = new SuiClient({
      url: getFullnodeUrl('localnet'),
    });
  
    const keypair = Ed25519Keypair.fromSecretKey('suiprivkey1qzhqe986lkq2g754suedd48lzvmw0gn5x692le9q6z30ez5nfkyqu9t444q');

    const tx = new Transaction();
    tx.setGasBudget(3_000_000);


      
    setSuiStatus(`Minted ${suiAmountToBurn} IBT_TOKEN successfully!`);
    connectSuiWallet();
  };

  useEffect(() => {
    if (ethUserAddress) {
      fetchEthBalance(ethUserAddress);
    }
  }, [ethUserAddress]);

  return (
    <div className="App" style={{ margin: '2rem' }}>
      <h1>My ERC20 Demo</h1>

      {/* ----------------------
          Ethereum Section
      ---------------------- */}
      <h2>Ethereum IBT</h2>
      <button onClick={connectEthWallet}>
        {ethUserAddress ? `Connected: ${ethUserAddress}` : "Connect Ethereum Wallet"}
      </button>
      <p>Ethereum IBT Balance: {ethBalance}</p>
      <p style={{ color: 'blue' }}>{ethStatus}</p>
      <div style={{ marginTop: '1rem' }}>
        <div>
          <label>Amount to Mint (ETH): </label>
          <input
            type="text"
            value={ethAmountToMint}
            onChange={(e) => setEthAmountToMint(e.target.value)}
            style={{ width: '100px' }}
          />
          <button onClick={handleEthMint}>Mint (ETH)</button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label>Amount to Burn (ETH): </label>
          <input
            type="text"
            value={ethAmountToBurn}
            onChange={(e) => setEthAmountToBurn(e.target.value)}
            style={{ width: '100px' }}
          />
          <button onClick={handleEthBurn}>Burn (ETH)</button>
        </div>
      </div>

      {/* ----------------------
          SUI Section
      ---------------------- */}
      <h2>SUI IBT</h2>
      <button onClick={connectSuiWallet}>
        {suiUserAddress ? `Connected: ${suiUserAddress}` : "Connect SUI Wallet"}
      </button>
      <p>SUI IBT Balance: {suiBalance}</p>
      <p style={{ color: 'blue' }}>{suiStatus}</p>
      <div style={{ marginTop: '1rem' }}>
        <div>
          <label>Amount to Mint (SUI): </label>
          <input
            type="text"
            value={suiAmountToMint}
            onChange={(e) => setSuiAmountToMint(e.target.value)}
            style={{ width: '100px' }}
          />
          <button onClick={handleSuiMint}>Mint (SUI)</button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label>Amount to Burn (SUI): </label>
          <input
            type="text"
            value={suiAmountToBurn}
            onChange={(e) => setSuiAmountToBurn(e.target.value)}
            style={{ width: '100px' }}
          />
          <button onClick={handleSuiBurn}>Burn (SUI)</button>
        </div>
      </div>
    </div>
  );
}

export default App;
