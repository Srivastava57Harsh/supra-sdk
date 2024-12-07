import { HexString, SupraAccount, SupraClient, BCS } from 'supra-l1-sdk';
import Logger from '../loaders/logger';

const FACTORY_ADDRESS = '0x335faef3a35932c83b5a2f7cff5edee7a9ff38bcb5c1ad6dc176e43ebd9af471';

export async function createToken(
  rpcUrl: string,
  creator: SupraAccount,
  name: string,
  symbol: string,
  initialSupply: number,
) {
  Logger.info('Creating token', { name, symbol, initialSupply });

  try {
    const client = await SupraClient.init(rpcUrl);

    // Check if account exists
    if (!(await client.isAccountExists(creator.address()))) {
      Logger.error('Creator account does not exist');
      throw new Error('Creator account does not exist');
    }

    // Create raw transaction
    const rawTx = await client.createRawTxObject(
      creator.address(),
      (
        await client.getAccountInfo(creator.address())
      ).sequence_number,
      FACTORY_ADDRESS.replace('0x', ''),
      'token_factory_gamma_testing_eight',
      'create_token',
      [], // type arguments
      [BCS.bcsSerializeStr(name), BCS.bcsSerializeStr(symbol), BCS.bcsSerializeUint64(initialSupply)],
    );

    // Create signed transaction
    const signedTx = SupraClient.createSignedTransaction(creator, rawTx);

    // Send transaction
    const txResult = await client.sendTxUsingSerializedRawTransaction(
      creator,
      //@ts-ignore
      rawTx,
      {
        enableWaitForTransaction: true,
        enableTransactionSimulation: true,
      },
    );

    Logger.info('Token creation transaction submitted', { txResult });
    return txResult;
  } catch (error) {
    Logger.error('Create token failed', { error });
    throw error;
  }
}

export async function registerForToken(rpcUrl: string, recipient: SupraAccount, tokenNumber: number = 0) {
  try {
    const client = await SupraClient.init(rpcUrl);

    if (!(await client.isAccountExists(recipient.address()))) {
      throw new Error('Recipient account does not exist');
    }

    const rawTx = await client.createRawTxObject(
      recipient.address(),
      (
        await client.getAccountInfo(recipient.address())
      ).sequence_number,
      FACTORY_ADDRESS.replace('0x', ''),
      'custom_token_testing_eight',
      'register',
      //@ts-ignore
      [`${FACTORY_ADDRESS}::custom_token_testing_eight::Token${tokenNumber}`],
      [],
    );

    const txResult = await client.sendTxUsingSerializedRawTransaction(
      recipient,
      //@ts-ignore
      rawTx,
      {
        enableWaitForTransaction: true,
        enableTransactionSimulation: true,
      },
    );

    Logger.info('Token registration transaction submitted', { txResult });
    return txResult;
  } catch (error) {
    Logger.error('Register token failed', { error });
    throw error;
  }
}

export async function transferTokens(
  rpcUrl: string,
  from: SupraAccount,
  to: string,
  amount: number,
  tokenNumber: number = 0,
) {
  try {
    const client = await SupraClient.init(rpcUrl);
    const toAddress = new HexString(to);

    if (!(await client.isAccountExists(from.address()))) {
      throw new Error('Sender account does not exist');
    }

    const rawTx = await client.createRawTxObject(
      from.address(),
      (
        await client.getAccountInfo(from.address())
      ).sequence_number,
      FACTORY_ADDRESS.replace('0x', ''),
      'custom_token_testing_eight',
      'transfer',
      //@ts-ignore
      [`${FACTORY_ADDRESS}::custom_token_testing_eight::Token${tokenNumber}`],
      [toAddress.toUint8Array(), BCS.bcsSerializeUint64(amount)],
    );

    const txResult = await client.sendTxUsingSerializedRawTransaction(
      from,
      //@ts-ignore
      rawTx,
      {
        enableWaitForTransaction: true,
        enableTransactionSimulation: true,
      },
    );

    Logger.info('Token transfer transaction submitted', { txResult });
    return txResult;
  } catch (error) {
    Logger.error('Transfer tokens failed', { error });
    throw error;
  }
}
