use bs58;
use dotenv::dotenv;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig, native_token::LAMPORTS_PER_SOL, signature::Keypair,
    signer::Signer, system_instruction::transfer, transaction::Transaction, pubkey::Pubkey,
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    let keypair_base58 =
        std::env::var("SECRET_KEY").expect("SECRET_KEY must be set.");    
    let keypair_bytes = bs58::decode(keypair_base58).into_vec()?;
    let keypair = Keypair::from_bytes(&keypair_bytes)?;
    let recipient = Pubkey::from_str_const("6ceiAQUy5k2rUMAsdXuqdcdUamDvGhuimytSxGmpBSmo");

    let client = RpcClient::new_with_commitment(
        String::from("https://api.devnet.solana.com"),
        CommitmentConfig::confirmed(),
    );

    let transfer_ix = transfer(
        &keypair.pubkey(),
        &recipient,
        LAMPORTS_PER_SOL,
    );


    let mut transaction = Transaction::new_with_payer(&[transfer_ix], Some(&keypair.pubkey()));
    transaction.sign(&[&keypair], client.get_latest_blockhash().await?);

    match client.send_and_confirm_transaction(&transaction).await {
        Ok(signature) => println!("Transaction Signature: {}", signature),
        Err(err) => eprintln!("Error sending transaction: {}", err),
    }

    Ok(())
}
