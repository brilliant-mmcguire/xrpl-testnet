const xrpl = require("xrpl");
const fs = require("fs");

async function main() {
  // Read wallets from JSON file
  const walletData = JSON.parse(fs.readFileSync("wallets.json", "utf8"));

  if (walletData.length === 0) {
    console.error("No wallets found in wallets.json");
    return;
  }

  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("Connected to XRPL Testnet\n");

  for (const wallet of walletData) {
    try {
      const response = await client.request({
        command: "account_info",
        account: wallet.address,
        ledger_index: "validated"
      });

      const xrpBalance = response.result.account_data.Balance / 1_000_000;
      console.log(`Wallet: ${wallet.address}\nBalance: ${xrpBalance} XRP\n`);
    } catch (err) {
      console.error(`Failed to get balance for ${wallet.address}: ${err.message}`);
    }
  }

  await client.disconnect();
}

main().catch(console.error);
