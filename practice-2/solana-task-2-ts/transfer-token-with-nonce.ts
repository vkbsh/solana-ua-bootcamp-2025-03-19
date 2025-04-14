import 'dotenv/config';
import base58 from 'bs58';

import {
	getMint,
	getAssociatedTokenAddress,
	createTransferCheckedInstruction,
	getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';

import {
	Keypair,
	PublicKey,
	Connection,
	Transaction,
	clusterApiUrl,
	SystemProgram,
	NonceAccount,
} from '@solana/web3.js';

const recipientPrivateKey = process.env['SECRET_KEY'];
const signerPrivateKeyBase58 = process.env['SECRET_KEY_BASE58'];

const signerKeypair = Keypair.fromSecretKey(
	base58.decode(signerPrivateKeyBase58),
);
const recipientKeypair = Keypair.fromSecretKey(
	new Uint8Array(JSON.parse(recipientPrivateKey)),
);
console.log(`Signer: ${signerKeypair.publicKey.toBase58()}`);
console.log(`Recipient: ${recipientKeypair.publicKey.toBase58()}`);

const tokenAddress = new PublicKey(
	'8FnWaniphsmh4rVkxsgHXVX4djZQxoxbhowewoNFHheq',
);

const noncePubkey = new PublicKey(
	'FRfjifAvnDLJosvwjocFjRSyuMtyYCddbefzS1Wf22tM',
);

const connection = new Connection(clusterApiUrl('devnet'));

const signerAta = await getAssociatedTokenAddress(
	tokenAddress,
	signerKeypair.publicKey,
);

console.log(`Signer ATA: ${signerAta.toBase58()}`);

const recipientAta = await getOrCreateAssociatedTokenAccount(
	connection,
	signerKeypair,
	tokenAddress,
	recipientKeypair.publicKey,
);

console.log(`Recipient ATA: ${recipientAta.address.toBase58()}`);

const tokenMint = await getMint(connection, tokenAddress);

const tx = new Transaction().add(
	SystemProgram.nonceAdvance({
		authorizedPubkey: recipientKeypair.publicKey,
		noncePubkey,
	}),
	createTransferCheckedInstruction(
		signerAta, // source
		tokenAddress, // mint
		recipientAta.address, // destination
		signerKeypair.publicKey, // owner of source account
		1 * 10 ** tokenMint.decimals, // amount to transfer
		tokenMint.decimals, // decimals of token
	),
);

const accountInfo = await connection.getAccountInfo(noncePubkey);
const nonceAccount = NonceAccount.fromAccountData(accountInfo.data);

tx.feePayer = recipientKeypair.publicKey;
tx.recentBlockhash = nonceAccount.nonce;

tx.partialSign(signerKeypair);

const serializedTransaction = tx.serialize({
	requireAllSignatures: false,
});

const transactionBase64 = serializedTransaction.toString('base64');

console.log(`Transaction Base64: ${transactionBase64}`);

const recoveredTransaction = Transaction.from(
	Buffer.from(transactionBase64, 'base64'),
);

recoveredTransaction.partialSign(recipientKeypair);

const txid = await connection.sendRawTransaction(
	recoveredTransaction.serialize(),
);

await connection.confirmTransaction(txid);

console.log(`Transaction : ${txid}`);
