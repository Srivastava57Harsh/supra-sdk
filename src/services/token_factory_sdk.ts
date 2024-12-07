import { SupraAccount, SupraClient, BCS, HexString } from 'supra-l1-sdk';
import Logger from '../loaders/logger';

const FACTORY_ADDRESS = '0xdc167abaaeefe34ca7426b800d6099584d4db56851b7dabb5c1d50925b691918';
const MODULE_NAME = 'token_factory_gamma_testing_twelve';

export async function createToken(
  rpcUrl: string,
  creator: SupraAccount,
  tokenOwner: string,
  name: string,
  symbol: string,
  initialSupply: number,
) {
  try {
    const client = await SupraClient.init(rpcUrl);

    if (creator.address().toString() !== FACTORY_ADDRESS) {
      throw new Error('Creator must be the factory contract deployer');
    }

    // Convert address string to bytes
    const ownerAddress = new HexString(tokenOwner);
    const ownerBytes = ownerAddress.toUint8Array();

    const rawTx = await client.createRawTxObject(
      creator.address(),
      (
        await client.getAccountInfo(creator.address())
      ).sequence_number,
      FACTORY_ADDRESS.replace('0x', ''),
      MODULE_NAME,
      'create_token',
      [], // type arguments
      [
        ownerBytes,
        BCS.bcsSerializeStr(name),
        BCS.bcsSerializeStr(symbol),
        BCS.bcsSerializeUint64(BigInt(initialSupply)),
      ],
    );

    const serializer = new BCS.Serializer();
    rawTx.serialize(serializer);
    const serializedTx = serializer.getBytes();

    const txResult = await client.sendTxUsingSerializedRawTransaction(creator, serializedTx, {
      enableWaitForTransaction: true,
      enableTransactionSimulation: true,
    });

    Logger.info('Token creation transaction submitted', { txResult });
    return txResult;
  } catch (error) {
    Logger.error('Create token failed', { error });
    throw error;
  }
}

export async function getTokenBalance(rpcUrl: string, tokenType: number, ownerAddress: string) {
  try {
    const client = await SupraClient.init(rpcUrl);
    const ownerHex = new HexString(ownerAddress);
    const balance = await client.getAccountCoinBalance(
      ownerHex,
      `${FACTORY_ADDRESS}::custom_token_testing_twelve::Token${tokenType}`,
    );

    // Convert BigInt to string/number for JSON serialization
    const result = {
      balance: Number(balance), // or balance.toString() if the number is too large
    };

    Logger.info('Token balance fetched', { result });
    return result;
  } catch (error) {
    Logger.error('Get balance failed', { error });
    throw error;
  }
}

export async function transferToken(
  rpcUrl: string,
  sender: SupraAccount,
  tokenType: number,
  recipient: string,
  amount: number,
) {
  try {
    const client = await SupraClient.init(rpcUrl);

    // Convert address to bytes
    const recipientAddress = new HexString(recipient);
    const recipientBytes = recipientAddress.toUint8Array();

    const rawTx = await client.createRawTxObject(
      sender.address(),
      (
        await client.getAccountInfo(sender.address())
      ).sequence_number,
      FACTORY_ADDRESS.replace('0x', ''),
      'custom_token_testing_twelve',
      'transfer',
      //@ts-ignore
      [`${FACTORY_ADDRESS}::custom_token_testing_twelve::Token${tokenType}`],
      [recipientBytes, BCS.bcsSerializeUint64(BigInt(amount))],
    );

    // Serialize the transaction
    const serializer = new BCS.Serializer();
    rawTx.serialize(serializer);
    const serializedTx = serializer.getBytes();

    const txResult = await client.sendTxUsingSerializedRawTransaction(sender, serializedTx, {
      enableWaitForTransaction: true,
      enableTransactionSimulation: true,
    });

    Logger.info('Token transfer completed', { txResult });
    return txResult;
  } catch (error) {
    Logger.error('Transfer token failed', { error });
    throw error;
  }
}

export async function registerForToken(rpcUrl: string, account: SupraAccount, tokenType: number) {
  try {
    const client = await SupraClient.init(rpcUrl);

    // Create raw transaction
    const rawTx = await client.createRawTxObject(
      account.address(),
      (
        await client.getAccountInfo(account.address())
      ).sequence_number,
      FACTORY_ADDRESS.replace('0x', ''),
      'custom_token_testing_twelve',
      'register',
      //@ts-ignore
      [`${FACTORY_ADDRESS}::custom_token_testing_twelve::Token${tokenType}`],
      [],
    );

    // Serialize the transaction
    const serializer = new BCS.Serializer();
    rawTx.serialize(serializer);
    const serializedTx = serializer.getBytes();

    // Send the transaction
    const txResult = await client.sendTxUsingSerializedRawTransaction(account, serializedTx, {
      enableWaitForTransaction: true,
      enableTransactionSimulation: true,
    });

    Logger.info('Token registration completed', { txResult });
    return txResult;
  } catch (error) {
    Logger.error('Register for token failed', { error });
    throw error;
  }
}
