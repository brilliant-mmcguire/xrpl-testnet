const xrpl = require("xrpl");
const fs = require("fs");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const wallets = JSON.parse(fs.readFileSync("wallets.json", "utf8"));

  if (wallets.length === 0) {
    console.error("No wallets found in wallets.json");
    return;
  }

  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("Connected to XRPL Testnet\n");

  for (let i = 0; i < wallets.length; i++) {
    const { address } = wallets[i];

    console.log(`Topping up wallet ${i + 1}: ${address}`);

    try {
      // Request the faucet to fund this wallet again
      const result = await client.fundWallet({ address });

      const newBalance = result.balance;
      console.log(`✅ Funded ${address} — New Balance: ${newBalance} XRP\n`);
    } catch (error) {
      console.error(`❌ Failed to fund ${address}: ${error.message}\n`);
    }

    // Avoid rate-limiting: wait 5 seconds between each faucet call
    await delay(5000);
  }

  await client.disconnect();
}

main().catch(console.error);
