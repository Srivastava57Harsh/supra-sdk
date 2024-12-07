import { HexString, SupraAccount } from 'supra-l1-sdk';
import Logger from '../loaders/logger';

const FACTORY_ADDRESS = '0x335faef3a35932c83b5a2f7cff5edee7a9ff38bcb5c1ad6dc176e43ebd9af471';

async function submitTransaction(rpcUrl: string, payload: any) {
  Logger.debug('Submitting transaction to RPC', { rpcUrl, payload });
  try {
    const response = await fetch(`${rpcUrl}/v1/transactions/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    Logger.debug('Transaction submission response', { result });
    return result;
  } catch (error) {
    Logger.error('Transaction submission failed', { error, payload });
    throw error;
  }
}

export async function createToken(
  rpcUrl: string,
  creator: SupraAccount,
  name: string,
  symbol: string,
  initialSupply: number,
) {
  Logger.info('Creating token', { name, symbol, initialSupply });
  try {
    const payload = {
      sender: creator.address,
      function: `${FACTORY_ADDRESS}::token_factory_gamma_testing_eight::create_token`,
      type_arguments: [],
      arguments: [name, symbol, initialSupply],
      max_gas_amount: 1000000,
      gas_unit_price: 100,
      expiration_timestamp_secs: Math.floor(Date.now() / 1000) + 600,
      signature: {
        type: 'ed25519_signature',
        //@ts-ignore
        public_key: creator.publicKey,
        signature: '',
      },
    };
    Logger.debug('Create token payload', { payload });
    return await submitTransaction(rpcUrl, payload);
  } catch (error) {
    Logger.error('Create token failed', { error, name, symbol });
    throw error;
  }
}

export async function registerForToken(rpcUrl: string, recipient: SupraAccount, tokenNumber: number = 0) {
  const payload = {
    sender: recipient.address,
    function: `${FACTORY_ADDRESS}::custom_token_testing_eight::register`,
    type_arguments: [`${FACTORY_ADDRESS}::custom_token_testing_eight::Token${tokenNumber}`],
    arguments: [],
    max_gas_amount: 1000000,
    gas_unit_price: 100,
    expiration_timestamp_secs: Math.floor(Date.now() / 1000) + 600,
    signature: {
      type: 'ed25519_signature',
      // @ts-ignore
      public_key: recipient.publicKey,
      signature: '', // Need to implement signature generation
    },
  };

  return submitTransaction(rpcUrl, payload);
}

export async function transferTokens(
  rpcUrl: string,
  from: SupraAccount,
  to: string,
  amount: number,
  tokenNumber: number = 0,
) {
  const payload = {
    sender: from.address,
    function: `${FACTORY_ADDRESS}::custom_token_testing_eight::transfer`,
    type_arguments: [`${FACTORY_ADDRESS}::custom_token_testing_eight::Token${tokenNumber}`],
    arguments: [to, amount],
    max_gas_amount: 1000000,
    gas_unit_price: 100,
    expiration_timestamp_secs: Math.floor(Date.now() / 1000) + 600,
    signature: {
      type: 'ed25519_signature',
      // @ts-ignore
      public_key: from.publicKey,
      signature: '', // Need to implement signature generation
    },
  };

  return submitTransaction(rpcUrl, payload);
}
