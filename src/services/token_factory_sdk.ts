import { SupraAccount, SupraClient, BCS, HexString, TxnBuilderTypes } from 'supra-l1-sdk';
import Logger from '../loaders/logger';
import { SUPRA_CONSTANTS } from '../constants';

export async function createToken(
  rpcUrl: string,
  creator: SupraAccount,
  tokenOwner: string,
  name: string,
  symbol: string,

  tokenType: string,
) {
  try {
    const initialSupply = 1000000;
    const client = await SupraClient.init(rpcUrl);

    try {
      const registerTx = await client.createRawTxObject(
        creator.address(),
        (
          await client.getAccountInfo(creator.address())
        ).sequence_number,
        SUPRA_CONSTANTS.FACTORY_ADDRESS.replace('0x', ''),
        'custom_token_testing_twelve',
        'register',
        //@ts-ignore
        [`${SUPRA_CONSTANTS.FACTORY_ADDRESS}::custom_token_testing_twelve::Token${tokenType}`],
        [],
      );

      const registerSerializer = new BCS.Serializer();
      registerTx.serialize(registerSerializer);
      await client.sendTxUsingSerializedRawTransaction(creator, registerSerializer.getBytes(), {
        enableWaitForTransaction: true,
      });

      Logger.info('Factory registered for Token0');
    } catch (regError) {
      Logger.warn('Registration might have failed or already exists', { regError });
    }

    // Then create the token
    const ownerAddress = new HexString(tokenOwner);
    const ownerBytes = ownerAddress.toUint8Array();

    const createTx = await client.createRawTxObject(
      creator.address(),
      (
        await client.getAccountInfo(creator.address())
      ).sequence_number,
      SUPRA_CONSTANTS.FACTORY_ADDRESS.replace('0x', ''),
      SUPRA_CONSTANTS.MODULE_FACTORY_NAME,
      'create_token',
      [],
      [
        ownerBytes,
        BCS.bcsSerializeStr(name),
        BCS.bcsSerializeStr(symbol),
        BCS.bcsSerializeUint64(BigInt(initialSupply)),
      ],
    );

    const serializer = new BCS.Serializer();
    createTx.serialize(serializer);
    const txResult = await client.sendTxUsingSerializedRawTransaction(creator, serializer.getBytes(), {
      enableWaitForTransaction: true,
    });

    const response = {
      txHash: txResult.txHash,
      result: txResult.result,
      tokenDetails: {
        tokenType: tokenType,
        name: name,
        symbol: symbol,
        initialSupply: initialSupply,
        owner: tokenOwner,
        contractAddress: SUPRA_CONSTANTS.FACTORY_ADDRESS,
        tokenIdentifier: `${SUPRA_CONSTANTS.FACTORY_ADDRESS}::custom_token_testing_twelve::Token${tokenType}`,
      },
    };

    Logger.info('Token creation transaction submitted', { txResult });

    return response;
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
      `${SUPRA_CONSTANTS.FACTORY_ADDRESS}::custom_token_testing_twelve::Token${tokenType}`,
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

    const typeTag = new TxnBuilderTypes.TypeTagStruct(
      TxnBuilderTypes.StructTag.fromString(
        `${SUPRA_CONSTANTS.FACTORY_ADDRESS}::custom_token_testing_twelve::Token${tokenType}`,
      ),
    );

    // Create serialized raw transaction directly
    const serializedTx = await client.createSerializedRawTxObject(
      sender.address(),
      (
        await client.getAccountInfo(sender.address())
      ).sequence_number,
      SUPRA_CONSTANTS.FACTORY_ADDRESS.replace('0x', ''),
      SUPRA_CONSTANTS.MODULE_TOKEN_NAME,
      'transfer',
      [typeTag],
      [recipientBytes, BCS.bcsSerializeUint64(BigInt(amount))],
    );

    // Send the transaction
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

    const accountInfo = await client.getAccountInfo(account.address());
    const sequenceNumber = accountInfo.sequence_number;

    const typeTag = new TxnBuilderTypes.TypeTagStruct(
      TxnBuilderTypes.StructTag.fromString(
        `${SUPRA_CONSTANTS.FACTORY_ADDRESS}::custom_token_testing_twelve::Token${tokenType}`,
      ),
    );

    const rawTx = await client.createRawTxObject(
      account.address(),
      sequenceNumber,
      SUPRA_CONSTANTS.FACTORY_ADDRESS.replace('0x', ''),
      SUPRA_CONSTANTS.MODULE_TOKEN_NAME,
      'register',
      [typeTag],
      [],
    );

    // Serialize the raw transaction
    const serializedTx = BCS.bcsToBytes(rawTx);

    // Submit the transaction and wait for results
    const txResult = await client.sendTxUsingSerializedRawTransaction(account, serializedTx, {
      enableWaitForTransaction: true,
      enableTransactionSimulation: true,
    });

    Logger.info('Token registration completed successfully', { txResult });
    return txResult;
  } catch (error) {
    Logger.error('Token registration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Failed to register for token: ${error.message}`);
  }
}
