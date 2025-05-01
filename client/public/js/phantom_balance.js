import { Connection, clusterApiUrl, PublicKey } from "https://cdn.jsdelivr.net/npm/@solana/web3.js@1.76.1/+esm";

const connection = new Connection(clusterApiUrl("mainnet-beta")); // también puedes usar 'devnet' para pruebas

window.connectPhantom = async function () {
  if ("solana" in window) {
    const provider = window.solana;

    if (provider.isPhantom) {
      try {
        const resp = await provider.connect();
        const publicKey = resp.publicKey.toString();
        document.getElementById("address").textContent = `🔑 Dirección: ${publicKey}`;

        // Consultar saldo
        const balanceLamports = await connection.getBalance(new PublicKey(publicKey));
        const balanceSol = balanceLamports / 1e9;
        document.getElementById("balance").textContent = `💰 Saldo: ${balanceSol.toFixed(5)} SOL`;

      } catch (err) {
        console.error("❌ Error conectando wallet:", err);
      }
    } else {
      alert("⚠️ Phantom no está instalado.");
    }
  } else {
    alert("⚠️ No se detecta una wallet Phantom. Instálala desde https://phantom.app");
  }
};
