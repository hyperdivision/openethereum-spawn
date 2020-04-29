const Parity = require('./')
const parityExec = require('parity-binary')

main().catch(console.error)

async function main () {
  const p = new Parity({
    parityExec,
    ipc: true,
    basePath: './data'
  })

  p.on('log', function (data) {
    console.log('parity log:', data)
  })

  const started = await p.started
  console.log('started and operational?', started)
  setTimeout(() => p.kill(), 1000)
  const code = await p.stopped
  console.log('stopped with', code)
}
