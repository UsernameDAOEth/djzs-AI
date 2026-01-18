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
        className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white shadow-lg backdrop-blur transition hover:bg-white/20"
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
