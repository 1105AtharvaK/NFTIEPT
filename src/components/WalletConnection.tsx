import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NETWORKS, useWallet, useMode } from '@/contexts/WalletContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WalletConnection = () => {
  const { 
    account, 
    chainId, 
    isConnecting, 
    isConnected, 
    connectWallet,
    switchNetwork
  } = useWallet();
  const { mode, setMode } = useMode();

  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS.SEPOLIA.chainId);

  const getNetworkName = () => {
    if (!chainId) return 'Not Connected';
    
    const network = Object.values(NETWORKS).find(net => net.chainId === chainId);
    return network ? network.chainName : 'Unknown Network';
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const handleNetworkChange = async (value: string) => {
    setSelectedNetwork(value);
    await switchNetwork(value);
  };

  return (
    <Card className="mb-6 border-nft-purple/20">
      <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium">Wallet Status</h3>
          {isConnected ? (
            <div className="text-sm text-muted-foreground">
              <span className="mr-2">Connected:</span>
              <span className="font-mono">{shortenAddress(account!)}</span>
              <span className="mx-2">|</span>
              <span className="mr-2">Network:</span>
              <span className="font-medium">{getNetworkName()}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect your wallet to mint NFT receipts
            </p>
          )}
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="flex items-center space-x-0 mr-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-l-md border border-nft-purple/40 font-medium transition-colors ${mode === 'demo' ? 'bg-nft-purple text-white' : 'bg-white text-nft-purple'}`}
              onClick={() => setMode('demo')}
              aria-pressed={mode === 'demo'}
            >
              Demo Mode
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-r-md border border-nft-purple/40 font-medium transition-colors ${mode === 'real' ? 'bg-nft-purple text-white' : 'bg-white text-nft-purple'}`}
              onClick={() => setMode('real')}
              aria-pressed={mode === 'real'}
            >
              Real Mode
            </button>
          </div>
          <Select value={selectedNetwork} onValueChange={handleNetworkChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NETWORKS.SEPOLIA.chainId}>Sepolia</SelectItem>
              <SelectItem value={NETWORKS.MUMBAI.chainId}>Mumbai</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={connectWallet}
            disabled={isConnecting || isConnected}
            className="bg-gradient-receipt hover:opacity-90 transition-opacity"
          >
            {isConnecting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Connecting
              </>
            ) : isConnected ? (
              'Connected'
            ) : (
              'Connect Wallet'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnection;
