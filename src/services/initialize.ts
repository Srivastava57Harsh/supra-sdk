import { SupraAccount, SupraClient, BCS } from 'supra-l1-sdk';
import Logger from '../loaders/logger';
import { SUPRA_CONSTANTS } from '../constants';

export async function initializeContract(supraClient: SupraClient, adminAccount: SupraAccount) {
  try {
    const rawTx = await supraClient.createRawTxObject(
      adminAccount.address(),
      (
        await supraClient.getAccountInfo(adminAccount.address())
      ).sequence_number,
      SUPRA_CONSTANTS.FACTORY_ADDRESS.replace('0x', ''),
      SUPRA_CONSTANTS.MODULE_FACTORY_NAME,
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
