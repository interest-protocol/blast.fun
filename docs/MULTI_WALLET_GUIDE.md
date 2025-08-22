# Multi-Wallet Support Guide

## Overview
The application now supports connecting and managing multiple Sui wallets simultaneously, allowing users to easily switch between different accounts.

## Features

### 1. Connect Multiple Wallets
- Click "Connect Wallet" to connect your first wallet
- Once connected, click on your wallet dropdown in the header
- Click "Add Wallet" button to connect additional wallets
- Each connected wallet will appear in the wallet list

### 2. Switch Between Wallets
- Click on your wallet dropdown in the header
- You'll see all connected wallets listed
- Click on any wallet to switch to it as the active account
- The active wallet is marked with a checkmark

### 3. Wallet Management
- **Active Wallet**: The currently selected wallet used for transactions
- **Wallet List**: Shows all connected wallets with their addresses
- **Add Wallet**: Connect additional wallets at any time
- **Disconnect**: Disconnect all wallets using the disconnect button

## Technical Implementation

### Context API Enhancement
The app context (`app.context.tsx`) has been enhanced with:
- `accounts`: Array of all connected wallet accounts
- `currentAccount`: The currently active wallet account
- `switchAccount`: Function to switch between connected accounts

### Hooks Used
- `useAccounts()`: Get all connected wallet accounts
- `useSwitchAccount()`: Switch between wallet accounts
- `useCurrentAccount()`: Get the currently active account

### Components
1. **WalletManager**: Main component for managing multiple wallets
2. **UserDropdown**: Enhanced to show wallet switching UI
3. **WalletAccountItem**: Individual wallet display component

## Usage Example

```typescript
import { useApp } from "@/context/app.context"

function MyComponent() {
  const { accounts, currentAccount, switchAccount } = useApp()
  
  // List all connected accounts
  accounts.forEach(account => {
    console.log(account.address)
  })
  
  // Switch to a different account
  const handleSwitch = (account) => {
    switchAccount(account)
  }
  
  return (
    <div>
      Current: {currentAccount?.address}
      {/* UI for switching accounts */}
    </div>
  )
}
```

## Benefits
1. **Convenience**: No need to disconnect/reconnect when switching accounts
2. **Security**: Each wallet maintains its own authorization
3. **Flexibility**: Use different wallets for different purposes
4. **User Experience**: Seamless switching between accounts

## Notes
- The active wallet is persisted in the session
- All wallet connections are maintained until explicitly disconnected
- Each wallet's SuiNS name (if available) is automatically resolved and displayed