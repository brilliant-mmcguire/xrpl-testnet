const xrpl = require("xrpl")
const fs = require("fs")

function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name" && args[i + 1]) parsed.name = args[i + 1].toLowerCase()
  }
  return parsed
}

async function main() {
  const { name } = parseArgs()

  if (!name) {
    console.error("❌ Please specify a wallet name with --name")
    return
  }

  const file = "wallets.json"
  let wallets = []

  if (fs.existsSync(file)) {
    wallets = JSON.parse(fs.readFileSync(file, "utf8"))
    if (wallets.find(w => w.name.toLowerCase() === name)) {
      console.error(`❌ A wallet named "${name}" already exists.`)
      return
    }
  }

  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()
  console.log("🔌 Connected to XRPL Testnet")

  console.log(`🚰 Requesting testnet XRP for new wallet "${name}"...`)
  const { wallet } = await client.fundWallet()

  console.log(`✅ Wallet funded!\nAddress: ${wallet.address}\nSeed: ${wallet.seed}`)

  // Add new wallet to file
  wallets.push({
    name,
    address: wallet.address,
    seed: wallet.seed,
  })

  fs.writeFileSync(file, JSON.stringify(wallets, null, 2))
  console.log(`💾 Saved "${name}" to wallets.json`)

  await client.disconnect()
}

main().catch(console.error)