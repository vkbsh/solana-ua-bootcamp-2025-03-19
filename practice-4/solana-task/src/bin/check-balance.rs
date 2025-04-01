use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{commitment_config::CommitmentConfig, native_token::LAMPORTS_PER_SOL, pubkey};
use dotenv::dotenv;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = RpcClient::new_with_commitment(
        String::from("https://api.devnet.solana.com"),
        CommitmentConfig::confirmed(),
    );

    let wallet = std::env::var("PUBLIC_KEY").expect("PUBLIC_KEY must be set.");
    let balance = client.get_balance(&wallet).await?;

    println!("{} SOL", balance / LAMPORTS_PER_SOL);

    Ok(())
}
