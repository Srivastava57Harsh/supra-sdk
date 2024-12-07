// import { SupraAccount } from 'supra-l1-sdk';
// import { createToken, registerForToken, transferTokens } from './token_factory_sdk';

// async function main() {
//   const RPC_URL = 'https://rpc-testnet.supra.com';

//   // Create accounts
//   const creator = new SupraAccount(Buffer.from('YOUR_PRIVATE_KEY', 'hex'));
//   const recipient = new SupraAccount(Buffer.from('RECIPIENT_PRIVATE_KEY', 'hex'));

//   // 1. Create token
//   console.log('Creating token...');
//   const createTx = await createToken(RPC_URL, creator, 'MyToken', 'MTK', 1000000);
//   console.log('Token created:', createTx);

//   // 2. Register recipient
//   console.log('Registering recipient...');
//   const registerTx = await registerForToken(RPC_URL, recipient);
//   console.log('Recipient registered:', registerTx);

//   // 3. Transfer tokens
//   console.log('Transferring tokens...');
//   const transferTx = await transferTokens(RPC_URL, creator, recipient.address().toString(), 1000);
//   console.log('Transfer complete:', transferTx);
// }

// main().catch(console.error);
