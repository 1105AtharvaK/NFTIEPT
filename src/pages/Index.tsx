import { WalletProvider } from '@/contexts/WalletContext';
import { ModeProvider } from '@/contexts/WalletContext';
import WalletConnection from '@/components/WalletConnection';
import ReceiptForm from '@/components/ReceiptForm';
import ViewReceipt from '@/components/ViewReceipt';

const Index = () => {
  return (
    <ModeProvider>
      <WalletProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8 text-center">
              <h1 className="text-4xl font-bold bg-gradient-receipt text-transparent bg-clip-text">
                NFT Receipt Generator
              </h1>
              <p className="mt-2 text-muted-foreground">
                Create and view blockchain-based receipts for your purchases
              </p>
            </header>

            <WalletConnection />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReceiptForm />
              <ViewReceipt />
            </div>
            
            <footer className="mt-12 text-center text-sm text-muted-foreground">
              <p>Connect your wallet to the Sepolia or Mumbai testnet to get started.</p>
              <p className="mt-1">
                <a 
                  href="https://sepoliafaucet.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-nft-purple hover:underline"
                >
                  Get Sepolia ETH
                </a>
                {' | '}
                <a 
                  href="https://mumbaifaucet.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-nft-purple hover:underline"
                >
                  Get Mumbai MATIC
                </a>
              </p>
            </footer>
          </div>
        </div>
      </WalletProvider>
    </ModeProvider>
  );
};

export default Index;
