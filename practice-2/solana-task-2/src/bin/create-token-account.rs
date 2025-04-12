use bs58;
use dotenv::dotenv;
use spl_token::ID;
use solana_sdk::{
    commitment_config::CommitmentConfig, native_token::LAMPORTS_PER_SOL, signature::Keypair,
    signer::Signer, system_instruction::transfer, transaction::Transaction, pubkey::Pubkey,
};

use solana_client::nonblocking::rpc_client::RpcClient;
use solana_client::rpc_client::RpcClient as OtherRpcClient;

use spl_associated_token_account::{
    get_associated_token_address_with_program_id, instruction::create_associated_token_account,
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    let keypair_base58 =
        std::env::var("SECRET_KEY").expect("SECRET_KEY must be set.");    
    let keypair_bytes = bs58::decode(keypair_base58).into_vec()?;
    let keypair = Keypair::from_bytes(&keypair_bytes)?;
    let mint = Pubkey::from_str_const("8UReKEpeSN329LyAue2RjXPpv11hyQp9gpkEemHCH69F");

    let associated_token_account = get_associated_token_address_with_program_id(
        &keypair.pubkey(), 
        &mint,           
        &ID,
    );

    let tx = create_associated_token_account(
        &keypair.pubkey(), 
        &keypair.pubkey(), 
        &mint,           
        &ID,
    );

    let client = RpcClient::new_with_commitment(
        String::from("https://api.devnet.solana.com"),
        CommitmentConfig::confirmed(),
    );

    let recent_blockhash = client.get_latest_blockhash().await?;

    let mut transaction = Transaction::new_signed_with_payer(
        &[tx],
        Some(&keypair.pubkey()),
        &[&keypair],
        recent_blockhash,
    );

    let signature = client.send_and_confirm_transaction(&transaction).await?;
    println!("Transaction Signature: {}", signature);

    println!("Associated Token Account: {}", associated_token_account);

    Ok(())
}
