const Parity = require('./')

main().catch(console.error)

async function main () {
  const p = new Parity({
    ipc: true,
    basePath: './data',
    stdio: 'inherit'
  })

  process.on('SIGINT', () => p.kill())

  const started = await p.started
  console.log('started and operational?', started)
  const code = await p.stopped
  console.log('stopped with', code)
}
