import { SupraAccount, SupraClient, BCS } from 'supra-l1-sdk';

export async function initializeContract(supraClient: SupraClient, adminAccount: SupraAccount) {
  const moduleAddress = '0x335faef3a35932c83b5a2f7cff5edee7a9ff38bcb5c1ad6dc176e43ebd9af471';
  const moduleName = 'token_factory_gamma_testing_eight';
  const functionName = 'initialize';

  try {
    const rawTx = await supraClient.createRawTxObject(
      adminAccount.address(),
      (await supraClient.getAccountInfo(adminAccount.address())).sequence_number,
      moduleAddress.replace('0x', ''),
      moduleName,
      functionName,
      [], 
      [] 
    );

    // Serialize the raw transaction
    const serializer = new BCS.Serializer();
    rawTx.serialize(serializer);
    const serializedTx = serializer.getBytes();

    const txResult = await supraClient.sendTxUsingSerializedRawTransaction(
      adminAccount,
      serializedTx,
      {
        enableWaitForTransaction: true,
        enableTransactionSimulation: true,
      }
    );

    console.log('Contract initialization transaction submitted:', txResult);
    return txResult;
  } catch (error) {
    console.error('Failed to initialize contract:', error);
    throw error;
  }
}
