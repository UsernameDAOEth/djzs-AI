import { useEffect, useMemo, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function DebugWalletStatus() {
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
  const { address, isConnecting, isConnected, status } = useAccount()
  const { connectors, connect, error: connectError, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const wcConnector = useMemo(
    () => connectors.find(c => c.id.includes('walletConnect') || c.name.includes('WalletConnect')),
    [connectors]
  )

  const injected = useMemo(
    () => connectors.find(c => c.id === 'injected'),
    [connectors]
  )

  const [log, setLog] = useState<string[]>([])
  const push = (m: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${m}`, ...prev].slice(0, 12))

  useEffect(() => {
    if (!projectId) push('❌ VITE_WALLETCONNECT_PROJECT_ID is MISSING at runtime.')
    else push('✅ Project ID detected at runtime.')
  }, [projectId])

  useEffect(() => {
    push(`wagmi status: ${status} | connected: ${isConnected} | addr: ${address ?? '—'}`)
  }, [status, isConnected, address])

  return (
    <div style={{padding: 16, border: '1px solid #444', borderRadius: 12, marginTop: 16}}>
      <h3>🔍 Debug Wallet Status</h3>
      <div>Project ID present: <b>{projectId ? 'YES' : 'NO'}</b></div>
      <div>Connectors ({connectors.length}): {connectors.map(c => c.name).join(', ') || '—'}</div>

      <div style={{display: 'flex', gap: 8, marginTop: 12}}>
        {injected && (
          <button
            onClick={() => connect({ connector: injected })}
            disabled={isPending || isConnecting}
          >
            {isPending || isConnecting ? 'Connecting…' : 'Connect (Injected)'}
          </button>
        )}
        {wcConnector && (
          <button
            onClick={() => connect({ connector: wcConnector })}
            disabled={isPending || isConnecting}
          >
            {isPending || isConnecting ? 'Connecting…' : 'Connect (WalletConnect)'}
          </button>
        )}
        {isConnected && <button onClick={() => disconnect()}>Disconnect</button>}
      </div>

      {connectError && (
        <div style={{color: 'tomato', marginTop: 8}}>
          <b>Error:</b> {String(connectError?.message || connectError)}
        </div>
      )}

      <details style={{marginTop: 10}}>
        <summary>Logs</summary>
        <pre style={{whiteSpace: 'pre-wrap'}}>{log.join('\n')}</pre>
      </details>
    </div>
  )
}
