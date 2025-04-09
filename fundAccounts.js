const xrpl = require("xrpl");
const fs = require("fs");

async function main() {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("Connected to XRPL Testnet");

  const walletCount = 2; // Change this to however many wallets you want
  const wallets = [];

  for (let i = 0; i < walletCount; i++) {
    const fundedWallet = await client.fundWallet();
    const { address, seed } = fundedWallet.wallet;

    console.log(`Wallet ${i + 1}: ${address} | Secret: ${seed}`);
    wallets.push({ address, seed });
  }

  fs.writeFileSync("wallets.json", JSON.stringify(wallets, null, 2));
  console.log(`\nSaved ${walletCount} wallet(s) to wallets.json`);

  await client.disconnect();
}

main().catch(console.error);
