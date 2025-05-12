import React, { useState } from 'react';
import { useWallet, useMode } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { ReceiptData } from '@/components/ViewReceipt';

const ReceiptForm = () => {
  const { contract, isConnected } = useWallet();
  const { mode } = useMode();
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTokenId, setLastTokenId] = useState<string | null>(null);

  const handleMintReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !isConnected) {
      toast.error('Wallet not connected');
      return;
    }

    if (!itemName.trim()) {
      toast.error('Item name is required');
      return;
    }

    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert ETH to Wei
      const priceInWei = ethers.utils.parseEther(price);
      
      console.log('Contract address:', contract.address);
      console.log('Price in Wei:', priceInWei.toString());
      console.log('Current network:', await contract.signer.provider?.getNetwork());
      
      // Call contract function with value parameter
      const tx = await contract.mintReceipt(itemName, priceInWei, {
        value: priceInWei // Add the value parameter to send ETH with the transaction
      });
      
      console.log('Transaction hash:', tx.hash);
      toast.info('Transaction submitted. Waiting for confirmation...', {
        duration: 10000
      });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      const blockNumber = receipt.blockNumber?.toString();
      if (blockNumber) {
        setLastTokenId(blockNumber);
        toast.success(`Receipt successfully minted with Block Number: ${blockNumber}`);
        // Store the receipt data in local storage
        const receiptData: ReceiptData = {
          tokenId: blockNumber,
          itemName: itemName,
          price: price,
          timestamp: new Date().toLocaleString(),
          owner: (await contract.signer.getAddress()),
        };
        const history = JSON.parse(localStorage.getItem('receiptHistory') || '[]');
        history.push(receiptData);
        localStorage.setItem('receiptHistory', JSON.stringify(history));
      } else {
        setLastTokenId(null);
        toast.success('Receipt successfully minted! (Block number could not be determined.)');
      }
      
      // Reset form
      setItemName('');
      setPrice('');
    } catch (error: any) {
      console.error('Error minting receipt:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data,
        transaction: error.transaction
      });
      toast.error(`Failed to mint receipt: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoMintReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      toast.error('Item name is required');
      return;
    }

    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate a delay for the transaction
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate a random tokenId for demo purposes
      const demoTokenId = Math.floor(Math.random() * 1000).toString();

      // Create a demo receipt
      const demoReceipt: ReceiptData = {
        tokenId: demoTokenId,
        itemName: itemName,
        price: price,
        timestamp: new Date().toLocaleString(),
        owner: 'Demo Owner',
      };

      // Store the demo receipt in local storage
      const history = JSON.parse(localStorage.getItem('receiptHistory') || '[]');
      history.push(demoReceipt);
      localStorage.setItem('receiptHistory', JSON.stringify(history));

      setLastTokenId(demoTokenId);
      toast.success(`Demo Receipt successfully minted with Token ID: ${demoTokenId}`);

      // Reset form
      setItemName('');
      setPrice('');
    } catch (error) {
      console.error('Error in demo minting:', error);
      toast.error('Failed to mint demo receipt. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 border-nft-purple/20">
      <CardHeader>
        <CardTitle className="text-xl">Generate NFT Receipt</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={mode === 'demo' ? handleDemoMintReceipt : handleMintReceipt} className="space-y-4">
          <div>
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter item name"
              disabled={isSubmitting}
              className="font-medium"
            />
          </div>
          <div>
            <Label htmlFor="price">Price in ETH</Label>
            <Input
              id="price"
              type="number"
              step="0.001"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
              className="font-mono"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-gradient-receipt hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Minting Receipt...
              </>
            ) : (
              'Generate Receipt'
            )}
          </Button>
          
          {lastTokenId && (
            <div className="mt-4 p-3 bg-nft-purple/10 rounded-md text-center">
              <p className="text-sm font-medium">Last Minted Token ID:</p>
              <p className="font-mono font-bold">{lastTokenId}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ReceiptForm;
