const xrpl = require("xrpl")
const fs = require("fs")

function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {}

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--from" && args[i + 1]) parsed.from = args[i + 1].toLowerCase()
    if (args[i] === "--to" && args[i + 1]) parsed.to = args[i + 1].toLowerCase()
    if (args[i] === "--amount" && args[i + 1]) parsed.amount = args[i + 1]
    if (args[i] === "--list") parsed.list = true
  }

  return parsed
}

async function listWallets(client, wallets) {
  console.log("📋 Available wallets:\n")
  for (const w of wallets) {
    try {
      const response = await client.request({
        command: "account_info",
        account: w.address,
        ledger_index: "validated",
      })

      const balanceXRP = xrpl.dropsToXrp(response.result.account_data.Balance)
      console.log(`🔹 ${w.name} - ${w.address}\n   Balance: ${balanceXRP} XRP\n`)
    } catch (err) {
      console.log(`❌ ${w.name} - ${w.address}\n   Error: ${err.message}\n`)
    }
  }
}

async function main() {
  const { from = "bob", to = "alice", amount = "10", list } = parseArgs()
  const wallets = JSON.parse(fs.readFileSync("wallets.json", "utf8"))

  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()

  if (list) {
    await listWallets(client, wallets)
    await client.disconnect()
    return
  }

  const senderInfo = wallets.find(w => w.name.toLowerCase() === from)
  const receiverInfo = wallets.find(w => w.name.toLowerCase() === to)

  if (!senderInfo || !receiverInfo) {
    console.error("❌ Invalid --from or --to name. Use --list to see available wallet names.")
    await client.disconnect()
    return
  }

  const senderWallet = xrpl.Wallet.fromSeed(senderInfo.seed)
  const amountDrops = xrpl.xrpToDrops(amount)

  console.log(`Sending ${amount} XRP from ${from} (${senderInfo.address}) to ${to} (${receiverInfo.address})...\n`)

  const tx = await client.autofill({
    TransactionType: "Payment",
    Account: senderWallet.address,
    Amount: amountDrops,
    Destination: receiverInfo.address,
  })

  const signed = senderWallet.sign(tx)
  const txResult = await client.submitAndWait(signed.tx_blob)

  if (txResult.result.meta.TransactionResult === "tesSUCCESS") {
    console.log("✅ Transfer successful!")
    console.log("Transaction hash:", txResult.result.hash)
  } else {
    console.error("❌ Transaction failed:", txResult.result.meta.TransactionResult)
  }

  await client.disconnect()
}

main().catch(console.error)