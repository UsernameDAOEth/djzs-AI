import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  Name,
  Identity,
} from "@coinbase/onchainkit/identity";

export function WalletConnectButton() {
  return (
    <Wallet>
      <ConnectWallet 
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:from-purple-500 hover:to-purple-400 hover:shadow-purple-500/50 hover:scale-105"
        data-testid="button-connect-wallet"
      >
        <Avatar className="h-5 w-5" />
        <Name />
      </ConnectWallet>
      
      <WalletDropdown>
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}
