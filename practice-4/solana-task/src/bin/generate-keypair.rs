use bs58;
use solana_sdk::signature::{Keypair, Signer};

fn main() {
    let prefix = "kbsh";

    println!("Generating keypair with prefix: {}", prefix);

    loop {
        let keypair = Keypair::new();
        let public_key = bs58::encode(keypair.pubkey().as_ref()).into_string();
        let secret_key = bs58::encode(keypair.to_bytes()).into_string();

        if public_key.starts_with(prefix) {
            println!("Public Key: {}", public_key);
            println!("Secret Key: {}", secret_key);
            
            break;
        }
    }
}
