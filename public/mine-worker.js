importScripts('./sha256.js')

onmessage = function (e) {
  const result = doProofOfWork(e.data)

  postMessage(result.randomString)
}

const fromHexString = (hexString) =>
  new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))

const getRandomArray = () => {
  const arr = new Uint8Array(8)
  for (let i = 0; i < 8; i += 1) {
    arr[i] = Math.floor(Math.random() * 255)
  }
  return arr
}

const toHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const doProofOfWork = ({ bagParams, landParams, lastMine, account }) => {
  const difficulty = bagParams.difficulty + landParams.difficulty

  const lastMineTx = (
    lastMine ?? '0000000000000000000000000000000000000000000000000000000000000000'
  ).substr(0, 16)

  const lastMineArr = fromHexString(lastMineTx)

  console.info(`Performing work with difficulty ${difficulty}, last tx is ${lastMineTx}...`)

  let good = false
  let itr = 0
  let hexDigest
  let randomArr
  let last

  const start = new Date().getTime()

  while (!good) {
    randomArr = getRandomArray()

    const combined = new Uint8Array(account.length + lastMineArr.length + randomArr.length)

    combined.set(account)
    combined.set(lastMineArr, account.length)
    combined.set(randomArr, account.length + lastMineArr.length)

    const hashSha256 = sha256.create()
    hashSha256.update(combined.slice(0, 24))
    hexDigest = hashSha256.hex()

    good = hexDigest.substr(0, 4) == '0000'

    if (good) {
      last = parseInt(hexDigest.substr(4, 1), 16)
      good = good && last <= difficulty
    }

    itr += 1

    if (itr % 1000000 === 0) {
      console.info(`Still mining - tried ${itr} iterations`)
    }
  }
  const end = new Date().getTime()

  const randomString = toHex(randomArr)

  console.info(
    `Found hash in ${itr} iterations with ${account} ${randomString}, last = ${last}, hex_digest ${hexDigest} taking ${
      (end - start) / 1000
    }s`
  )

  return { randomString, hexDigest }
}
