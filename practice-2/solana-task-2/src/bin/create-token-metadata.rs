use dotenv::dotenv;

use solana_client::nonblocking::rpc_client::RpcClient;

use solana_sdk::{
    pubkey::Pubkey,
    transaction::Transaction,
    signer::keypair::{Keypair, Signer},
    commitment_config::CommitmentConfig,
};
use mpl_token_metadata::{
    programs::MPL_TOKEN_METADATA_ID,
    instructions::{CreateMetadataAccountV3, CreateMetadataAccountV3InstructionArgs, CreateMetadataAccountV3Builder},
    types::{DataV2},
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    let keypair_base58 =
        std::env::var("SECRET_KEY").expect("SECRET_KEY must be set.");
    let keypair_bytes = bs58::decode(keypair_base58).into_vec()?;
    let signer_keypair = Keypair::from_bytes(&keypair_bytes)?;
    let mint_pubkey = Pubkey::from_str_const("8UReKEpeSN329LyAue2RjXPpv11hyQp9gpkEemHCH69F");
    
    let client = RpcClient::new_with_commitment(
        String::from("https://api.devnet.solana.com"),
        CommitmentConfig::confirmed(),
    );

    let (metadata_PDA, metadata_bump_seed) = Pubkey::find_program_address(
        &[b"metadata", MPL_TOKEN_METADATA_ID.as_ref(), mint_pubkey.as_ref()],
        &MPL_TOKEN_METADATA_ID
    );
    
    println!("PDA: {:?}", metadata_PDA);
    
    let data = DataV2 {
        name: "Not Not coin".to_string(),
        symbol: "NNC".to_string(),
        uri: "https://arweave.net/tQ0E2wu869poiv01OQGaMKMs9fHsl8HCKvAJqvRfLmU".to_string(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };
    
    println!("data : {:?}", data);
    
    let args = CreateMetadataAccountV3InstructionArgs{
        data: data.clone(),
        is_mutable: true,
        collection_details: None,
    };
    
    println!("args : {:?}", args);


    let tx = CreateMetadataAccountV3Builder::new()
        .metadata(metadata_PDA)
        .mint(mint_pubkey)
        .mint_authority(signer_keypair.pubkey())
        .payer(signer_keypair.pubkey())
        .update_authority(signer_keypair.pubkey(), true)
        .system_program(solana_sdk::system_program::id())
        .rent(None)
        .data(data)
        .is_mutable(true)
        .instruction();


    let mut transaction = Transaction::new_signed_with_payer(
        &[tx],
        Some(&signer_keypair.pubkey()),
        &[&signer_keypair],
        client.get_latest_blockhash().await?,
    );

    let signature = client.send_and_confirm_transaction(&transaction).await?;
    println!("Transaction Signature: {}", signature);


    Ok(())
}
