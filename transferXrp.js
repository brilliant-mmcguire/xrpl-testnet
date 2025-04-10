const xrpl = require("xrpl")
const fs = require("fs")

async function main() {
  const wallets = JSON.parse(fs.readFileSync("wallets.json", "utf8"))

  if (wallets.length < 2) {
    console.error("Need at least two wallets in wallets.json")
    return
  }

  // Choose sender and receiver
  const senderInfo = wallets[0]
  const receiverInfo = wallets[1]

  // Connect to XRPL Testnet
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()
  console.log("Connected to XRPL Testnet")

  // Reconstruct the sender wallet from its seed
  const senderWallet = xrpl.Wallet.fromSeed(senderInfo.seed)

  // Define amount (in drops: 1 XRP = 1,000,000 drops)
  const amountXrp = "10"
  const amountDrops = xrpl.xrpToDrops(amountXrp)

  console.log(`Sending ${amountXrp} XRP from ${senderInfo.address} to ${receiverInfo.address}...\n`)

  // Create and autofill transaction
  const tx = await client.autofill({
    TransactionType: "Payment",
    Account: senderWallet.address,
    Amount: amountDrops,
    Destination: receiverInfo.address,
  })

  // Sign and submit
  const signed = senderWallet.sign(tx)
  const txResult = await client.submitAndWait(signed.tx_blob)

  // Output result
  if (txResult.result.meta.TransactionResult === "tesSUCCESS") {
    console.log("✅ Transfer successful!")
    console.log("Transaction hash:", txResult.result.hash)
  } else {
    console.error("❌ Transaction failed:", txResult.result.meta.TransactionResult)
  }

  await client.disconnect()
}

main().catch(console.error)
