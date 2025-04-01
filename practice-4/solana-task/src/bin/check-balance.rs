use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{commitment_config::CommitmentConfig, native_token::LAMPORTS_PER_SOL, pubkey};


#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = RpcClient::new_with_commitment(
        String::from("https://api.devnet.solana.com"),
        CommitmentConfig::confirmed(),
    );

    let wallet = pubkey!("kbshAfYTZfF95J3bqsy34m4F4Kac1EHDPYBXsWt8YQX");
    let balance = client.get_balance(&wallet).await?;

    println!("{} SOL", balance / LAMPORTS_PER_SOL);

    Ok(())
}
