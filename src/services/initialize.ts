import { SupraAccount, SupraClient, BCS } from 'supra-l1-sdk';
import Logger from '../loaders/logger';

const FACTORY_ADDRESS = '0xdc167abaaeefe34ca7426b800d6099584d4db56851b7dabb5c1d50925b691918';
const MODULE_NAME = 'token_factory_gamma_testing_twelve';

export async function initializeContract(supraClient: SupraClient, adminAccount: SupraAccount) {
  try {
    const rawTx = await supraClient.createRawTxObject(
      adminAccount.address(),
      (
        await supraClient.getAccountInfo(adminAccount.address())
      ).sequence_number,
      FACTORY_ADDRESS.replace('0x', ''),
      MODULE_NAME,
      'initialize',
      [],
      [],
    );

    const serializer = new BCS.Serializer();
    rawTx.serialize(serializer);
    const serializedTx = serializer.getBytes();

    const txResult = await supraClient.sendTxUsingSerializedRawTransaction(adminAccount, serializedTx, {
      enableWaitForTransaction: true,
      enableTransactionSimulation: true,
    });

    Logger.info('Contract initialization transaction submitted:', txResult);
    return txResult;
  } catch (error) {
    Logger.error('Failed to initialize contract:', error);
    throw error;
  }
}
