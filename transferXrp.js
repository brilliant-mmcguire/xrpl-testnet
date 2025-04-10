const xrpl = require("xrpl")
const fs = require("fs")

async function main() {
  const args = process.argv.slice(2)
  const reverse = args.includes("--reverse")

  const wallets = JSON.parse(fs.readFileSync("wallets.json", "utf8"))
  if (wallets.length < 2) {
    console.error("Need at least two wallets in wallets.json")
    return
  }

  // Determine sender and receiver
  const senderInfo = reverse ? wallets[1] : wallets[0]
  const receiverInfo = reverse ? wallets[0] : wallets[1]

  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()
  console.log("Connected to XRPL Testnet")

  const senderWallet = xrpl.Wallet.fromSeed(senderInfo.seed)

  // Define transfer amount
  const amountXrp = "10"
  const amountDrops = xrpl.xrpToDrops(amountXrp)

  console.log(`Sending ${amountXrp} XRP from ${senderInfo.address} to ${receiverInfo.address}...\n`)

  // Create, sign, and submit the transaction
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
