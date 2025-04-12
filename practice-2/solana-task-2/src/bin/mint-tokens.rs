use bs58;
use dotenv::dotenv;
use spl_token::{instruction::mint_to, ID};
use solana_sdk::{
    commitment_config::CommitmentConfig, signature::Keypair,
    signer::Signer, transaction::Transaction, pubkey::Pubkey,
};

use solana_client::nonblocking::rpc_client::RpcClient;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    let keypair_base58 =
        std::env::var("SECRET_KEY").expect("SECRET_KEY must be set.");    
    let keypair_bytes = bs58::decode(keypair_base58).into_vec()?;
    let keypair = Keypair::from_bytes(&keypair_bytes)?;

    let mint = Pubkey::from_str_const("8UReKEpeSN329LyAue2RjXPpv11hyQp9gpkEemHCH69F");
    let recipient_ata = Pubkey::from_str_const("G5CPuZQJgx7TKfWueoJsbzzE8Uh1wbN9hbPb8LH1hjVR"); 
    let amount = 2 * 10u64.pow(2);

    let ix = 
        mint_to(
        &ID,
        &mint,
        &recipient_ata,
        &keypair.pubkey(),
        &[
            &keypair.pubkey(),
        ],
        amount
    ).unwrap();

    let client = RpcClient::new_with_commitment(
        String::from("https://api.devnet.solana.com"),
        CommitmentConfig::confirmed(),
    );

    let recent_blockhash = client.get_latest_blockhash().await?;

    let mut transaction = Transaction::new_signed_with_payer(
        &[ix], 
        Some(&keypair.pubkey()),
        &[&keypair],
        recent_blockhash,
    );

    let signature = client.send_and_confirm_transaction(&transaction).await?;
    println!("Transaction Signature: {}", signature);


    Ok(())
}
