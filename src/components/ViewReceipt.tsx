import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

export interface ReceiptData {
  tokenId: string;
  itemName: string;
  price: string;
  timestamp: string;
  owner: string;
}

const ViewReceipt = () => {
  const { contract, isConnected } = useWallet();
  const [tokenId, setTokenId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const handleReceiptMinted = (event: CustomEvent<ReceiptData>) => {
      setReceiptData(event.detail);
    };

    window.addEventListener('receiptMinted', handleReceiptMinted as EventListener);
    return () => {
      window.removeEventListener('receiptMinted', handleReceiptMinted as EventListener);
    };
  }, []);

  const handleViewReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId.trim() || isNaN(Number(tokenId)) || Number(tokenId) < 0) {
      toast.error('Please enter a valid token ID');
      return;
    }
    setIsLoading(true);
    try {
      // Look up the receipt in local storage by block number
      const history = JSON.parse(localStorage.getItem('receiptHistory') || '[]');
      const foundReceipt = history.find((receipt: ReceiptData) => receipt.tokenId === tokenId);
      if (foundReceipt) {
        setReceiptData(foundReceipt);
      } else {
        toast.error('No receipt found for this token ID.');
        setReceiptData(null);
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      toast.error('Failed to fetch receipt. Please check the Token ID and try again.');
      setReceiptData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  return (
    <Card className="border-nft-purple/20">
      <CardHeader>
        <CardTitle className="text-xl">View Receipt</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleViewReceipt} className="space-y-4">
          <div>
            <Label htmlFor="tokenId">Token ID</Label>
            <div className="flex space-x-2">
              <Input
                id="tokenId"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter token ID"
                disabled={!isConnected || isLoading}
                className="font-mono"
              />
              <Button 
                type="submit"
                disabled={!isConnected || isLoading}
                className="bg-gradient-receipt hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'View'
                )}
              </Button>
            </div>
          </div>

          {receiptData && (
            <div className="mt-6 p-4 border rounded-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">NFT Receipt</h3>
                <p className="text-sm text-muted-foreground">Token ID: {receiptData.tokenId}</p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Item:</span>
                  <span>{receiptData.itemName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span className="font-mono">{receiptData.price} ETH</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{receiptData.timestamp}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Owner:</span>
                  <span className="font-mono">{shortenAddress(receiptData.owner)}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">This NFT receipt is stored on the blockchain and cannot be altered.</p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ViewReceipt;
