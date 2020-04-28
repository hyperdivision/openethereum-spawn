const Parity = require('.')

const p = new Parity({
  parityExec: './parity',

  basePath: './parity-data',
  port: 3000,
  light: true,
  onDemandTimeWindow: 120,
  ws: false,
  jsonrpc: false,
  ipc: true,
  ipcPath: './parity.sock',
  apis: ['eth', 'parity_pubsub'],
  chain: 'foundation',
  minPeers: 75,
  maxPeers: 256,
  logging: {
    rpc: 'trace'
  }
})
