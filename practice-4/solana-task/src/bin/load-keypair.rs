use solana_sdk::signature::Signer;
use solana_sdk::signer::keypair::Keypair;
use dotenv::dotenv;
use bs58;

fn main() -> Result<(), Box<dyn std::error::Error>> {
  dotenv().ok();

  let keypair_base58 =
        std::env::var("SECRET_KEY").expect("SECRET_KEY must be set.");

  println!("SECRET_KEY: {:?}", keypair_base58);

  let keypair_bytes = bs58::decode(keypair_base58).into_vec()?;
  let keypair = Keypair::from_bytes(&keypair_bytes)?;

  println!("Public Key: {:?}", keypair.pubkey());

  Ok(())
}
