# `openethereum-spawn`

[![Build Status](https://travis-ci.org/hyperdivision/openethereum-spawn.svg?branch=master)](https://travis-ci.org/hyperdivision/openethereum-spawn)

> (formerly `parity-spawn`)

## Usage

```js
const OpenEthereum = require('openethereum-spawn')

main().catch(console.error)

async function main () {
  const p = new OpenEthereum({
    exec: require('openethereum-binary'),
    ipc: true,
    basePath: './data'
  })

  p.on('log', function (data) {
    console.log('openethereum log:', data)
  })

  process.on('SIGINT', () => p.kill())

  const started = await p.started
  console.log('started and operational?', started)
  const code = await p.stopped
  console.log('stopped with', code)
}

```

## API

### ``

## Install

```sh
npm install openethereum-spawn
```

## License

[ISC](LICENSE)
