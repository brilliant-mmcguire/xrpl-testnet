const xrpl = require("xrpl");

async function main() {
  // Connect to the XRP Testnet
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()
  console.log("Connected to XRPL Testnet")

  // Use the testnet faucet to create and fund a new wallet
  const fundedWallet = await client.fundWallet()
  console.log("Funded wallet address:", fundedWallet.wallet.address)
  console.log("Secret:", fundedWallet.wallet.seed)

  // Check the balance
  const accountInfo = await client.request({
    command: "account_info",
    account: fundedWallet.wallet.address,
    ledger_index: "validated"
  })

  console.log("Balance:", accountInfo.result.account_data.Balance / 1_000_000, "XRP")

  await client.disconnect()
}

main().catch(console.error)