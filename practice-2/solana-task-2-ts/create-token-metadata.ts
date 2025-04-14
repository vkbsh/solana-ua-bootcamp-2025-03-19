import 'dotenv/config';

import {
	Keypair,
	PublicKey,
	Connection,
	clusterApiUrl,
	Transaction,
	sendAndConfirmTransaction,
} from '@solana/web3.js';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
	'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);
const tokenMint = new PublicKey('8FnWaniphsmh4rVkxsgHXVX4djZQxoxbhowewoNFHheq');

const SECRET_KEY = 'SECRET_KEY';
const privateKey = process.env[SECRET_KEY];

if (privateKey === undefined) {
	console.log(`Add ${SECRET_KEY} to .env!`);
	process.exit(1);
}

const connection = new Connection(clusterApiUrl('devnet'));
const signer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));

const metadata = {
	name: 'Kibish Token',
	symbol: 'KBSHT',
	uri: 'https://maroon-abundant-boar-405.mypinata.cloud/ipfs/bafybeiggphv5m3rggvcmbqhqvaebrxk6ln4ak5eklj7ex4rjt6v736w6ii',
	sellerFeeBasisPoints: 0,
	creators: null,
	collection: null,
	uses: null,
};

const [metadataPDA, _metadataBump] = PublicKey.findProgramAddressSync(
	[
		Buffer.from('metadata'),
		TOKEN_METADATA_PROGRAM_ID.toBuffer(),
		tokenMint.toBuffer(),
	],
	TOKEN_METADATA_PROGRAM_ID,
);

const tx = new Transaction().add(
	createCreateMetadataAccountV3Instruction(
		{
			metadata: metadataPDA,
			mint: tokenMint,
			mintAuthority: signer.publicKey,
			payer: signer.publicKey,
			updateAuthority: signer.publicKey,
		},
		{
			createMetadataAccountArgsV3: {
				collectionDetails: null,
				data: metadata,
				isMutable: true,
			},
		},
	),
);

tx.feePayer = signer.publicKey;
tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

const signature = await sendAndConfirmTransaction(connection, tx, [signer]);

console.log(`Transaction: ${signature}`);
