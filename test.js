const OpenEthereum = require('./')
const openethereumExec = require('openethereum-binary')

main().catch(console.error)

async function main () {
  const p = new OpenEthereum({
    openethereumExec,
    ipc: true,
    basePath: './data'
  })

  p.on('log', function (data) {
    console.log('openethereum log:', data)
  })

  const started = await p.started
  console.log('started and operational?', started)
  setTimeout(() => p.kill(), 1000)
  const code = await p.stopped
  console.log('stopped with', code)
}
