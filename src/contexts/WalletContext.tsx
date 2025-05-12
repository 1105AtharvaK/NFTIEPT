import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

// Network configurations
export const NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/demo', // Using Alchemy's public demo endpoint
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  MUMBAI: {
    chainId: '0x13881',
    chainName: 'Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  }
};

// NFT Receipt ABI - minimal ABI for the functions we need
export const NFT_RECEIPT_ABI = [
  'function mintReceipt(string memory itemName, uint256 priceInWei) public payable returns (uint256)',
  'function getReceipt(uint256 tokenId) public view returns (string memory itemName, uint256 price, uint256 timestamp, address owner)'
];

// Contract addresses on different networks
export const CONTRACT_ADDRESSES = {
  [NETWORKS.SEPOLIA.chainId]: import.meta.env.VITE_SEPOLIA_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890',
  [NETWORKS.MUMBAI.chainId]: import.meta.env.VITE_MUMBAI_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
};

interface WalletContextType {
  account: string | null;
  chainId: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (networkId: string) => Promise<void>;
  contract: ethers.Contract | null;
  provider: ethers.providers.Web3Provider | null;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => {},
  contract: null,
  provider: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const resetWalletState = () => {
    setAccount(null);
    setChainId(null);
    setContract(null);
  };

  // Setup contract instance when provider and chainId change
  useEffect(() => {
    if (provider && chainId && CONTRACT_ADDRESSES[chainId]) {
      const contractAddress = CONTRACT_ADDRESSES[chainId];
      const signer = provider.getSigner();
      const nftReceiptContract = new ethers.Contract(contractAddress, NFT_RECEIPT_ABI, signer);
      setContract(nftReceiptContract);
    } else {
      setContract(null);
    }
  }, [provider, chainId]);

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // Disconnected
      resetWalletState();
      toast.error('Wallet disconnected');
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      toast.success(`Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainIdHex: string) => {
    setChainId(chainIdHex);
    // Reload the page to avoid any issues
    window.location.reload();
  };

  // Setup event listeners for wallet
  useEffect(() => {
    const setupEventListeners = () => {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        };
      }
    };

    const cleanup = setupEventListeners();
    return cleanup;
  }, [account]);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not found. Please install MetaMask browser extension.');
      return;
    }

    setIsConnecting(true);

    try {
      // Request accounts
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await ethProvider.send('eth_requestAccounts', []);
      const currentChainId = await ethProvider.send('eth_chainId', []);
      
      setProvider(ethProvider);
      setAccount(accounts[0]);
      setChainId(currentChainId);

      // Default to Sepolia if not on a supported network
      if (!CONTRACT_ADDRESSES[currentChainId]) {
        await switchNetwork(NETWORKS.SEPOLIA.chainId);
      }

    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Could not connect to wallet. Please try again.');
      resetWalletState();
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    resetWalletState();
    toast.info('Wallet disconnected');
  };

  // Switch network
  const switchNetwork = async (networkId: string) => {
    if (!window.ethereum) return;
    
    const network = Object.values(NETWORKS).find(net => net.chainId === networkId);
    if (!network) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain hasn't been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: networkId,
                chainName: network.chainName,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.blockExplorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error(`Failed to add ${network.chainName} network to MetaMask`);
        }
      } else {
        console.error('Error switching network:', switchError);
        toast.error(`Failed to switch to ${network.chainName} network`);
      }
    }
  };

  const value = {
    account,
    chainId,
    isConnecting,
    isConnected: !!account,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    contract,
    provider,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Add MetaMask type to window object
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Mode context for demo/real mode
export type AppMode = 'demo' | 'real';
const ModeContext = createContext<{ mode: AppMode; setMode: (m: AppMode) => void }>({ mode: 'real', setMode: () => {} });
export const useMode = () => useContext(ModeContext);
export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('real');
  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
};
