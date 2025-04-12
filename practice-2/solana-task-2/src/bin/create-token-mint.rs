use bs58;
use dotenv::dotenv;
use solana_sdk::signature::Signer;
use solana_sdk::signer::keypair::Keypair;
use spl_token::{
    id, 
    instruction::initialize_mint,
    state::Mint,
};
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    transaction::Transaction,
    program_pack::Pack,
    system_instruction::create_account,
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    
    let keypair_base58 =
        std::env::var("SECRET_KEY").expect("SECRET_KEY must be set.");
    
    let program_id = id();
    let mint_keypair = Keypair::new();
    let keypair_bytes = bs58::decode(keypair_base58).into_vec()?;
    let signer_keypair = Keypair::from_bytes(&keypair_bytes)?;

    println!("Program ID: {:?}", program_id);
    println!("Mint: {:?}", mint_keypair.pubkey());
    println!("Public Key: {:?}", signer_keypair.pubkey());

    let client = RpcClient::new_with_commitment(
        String::from("https://api.devnet.solana.com"),
        CommitmentConfig::confirmed(),
    );

    let mint_space = Mint::LEN;
    let rent = client.get_minimum_balance_for_rent_exemption(mint_space.try_into().unwrap()).await?;
    let recent_blockhash = client.get_latest_blockhash().await?;

    println!("Rent: {:?}", rent);

    let create_account_instruction = create_account(
        &signer_keypair.pubkey(),
        &mint_keypair.pubkey(),
        rent,
        mint_space.try_into().unwrap(),
        &program_id,   
    );

    let initialize_mint_instruction = initialize_mint(
        &program_id,
        &mint_keypair.pubkey(),
        &signer_keypair.pubkey(),
        Some(&signer_keypair.pubkey()),
        2
    )?;


    let mut transaction = Transaction::new_signed_with_payer(
        &[
            create_account_instruction,
            initialize_mint_instruction
        ], 
        Some(&signer_keypair.pubkey()),
        &[&signer_keypair, &mint_keypair],
        recent_blockhash,
    );

    let signature = client.send_and_confirm_transaction(&transaction).await?;
    println!("Transaction Signature: {}", signature);

    Ok(())
}



