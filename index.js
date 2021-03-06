const path = require('path')
const os = require('os')
const net = require('net')
const { spawn } = require('child_process')
const NewlineDecoder = require('newline-decoder')
const { EventEmitter } = require('events')

class OpenEthereum extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.execPath = opts.exec == null ? 'openethereum' : path.resolve(opts.exec)
    this.argv = []

    if (opts.port) this.argv.push('--port', opts.port)
    if (opts.chain) this.argv.push('--chain', opts.chain)
    if (opts.light !== false) this.argv.push('--light')

    if (opts.basePath) {
      this.basePath = path.resolve(opts.basePath)
    } else {
      switch (os.platform()) {
        case 'darwin':
          this.basePath = path.join(os.homedir(), 'Library/Application Support/io.parity.ethereum')
          break
        case 'win32':
          this.basePath = path.join(os.homedir(), 'AppData/Local/Parity/Ethereum')
          break
        case 'linux':
        default:
          this.basePath = path.join(os.homedir(), '.local/share/io.parity.ethereum')
          break
      }
    }

    this.argv.push('--base-path', this.basePath)

    if (opts.ws === false) this.argv.push('--no-ws')
    if (opts.jsonrpc === false) this.argv.push('--no-jsonrpc')
    if (opts.ipc === false) this.argv.push('--no-ipc')

    if (opts.ipcPath) {
      this.ipcPath = path.resolve(opts.ipcPath)
    } else {
      this.ipcPath = path.join(this.basePath, 'jsonpath.ipc')
    }
    this.argv.push('--ipc-path', this.ipcPath)

    if (Array.isArray(opts.apis)) {
      if (opts.ws !== false) this.argv.push('--ws-apis', opts.apis.join())
      if (opts.jsonrpc !== false) this.argv.push('--jsonrpc-apis', opts.apis.join())
      if (opts.ipc !== false) this.argv.push('--ipc-apis', opts.apis.join())
    }

    if (typeof opts.onDemandTimeWindow === 'number') this.argv.push('--on-demand-time-window', opts.onDemandTimeWindow)
    if (typeof opts.minPeers === 'number') this.argv.push('--min-peers', opts.minPeers)
    if (typeof opts.maxPeers === 'number') this.argv.push('--max-peers', opts.maxPeers)

    if (opts.logging) {
      const modules = Object.entries(opts.logging).map(p => p.join('=')).join()
      this.argv.push('--logging', modules)
    }

    if (Array.isArray(opts.argv)) this.argv.push(...opts.argv)

    this.process = spawn(this.execPath, this.argv, { stdio: opts.stdio })
    this.started = isRunningPoll(this.ipcPath, this.process)
    this.stopped = new Promise(resolve => {
      this.process.on('exit', resolve)
    })

    const stdout = new NewlineDecoder()
    const stderr = new NewlineDecoder()

    if (this.process.stdout) {
      this.process.stdout.on('data', (data) => {
        for (const line of stdout.push(data)) {
          this.emit('log', line, 'stdout')
        }
      })
    }

    if (this.process.stderr) {
      this.process.stderr.on('data', (data) => {
        for (const line of stderr.push(data)) {
          this.emit('log', line, 'stderr')
        }
      })
    }
  }

  kill () {
    this.process.kill()
  }
}

async function isRunningPoll (ipc, proc) {
  return new Promise(resolve => {
    proc.on('exit', onexit)
    let timeout
    poll()

    function poll () {
      isRunning(ipc).then(function (yes) {
        if (yes) {
          proc.removeListener('exit', onexit)
          resolve(true)
          return
        }

        timeout = setTimeout(poll, 100)
      })
    }

    function onexit () {
      clearTimeout(timeout)
      proc.removeListener('exit', onexit)
      resolve(false)
    }
  })
}

async function isRunning (ipc) {
  return new Promise(resolve => {
    net.connect(ipc)
      .on('connect', function () {
        this.destroy()
        resolve(true)
      })
      .on('error', function () {
        resolve(false)
      })
  })
}

module.exports = OpenEthereum
