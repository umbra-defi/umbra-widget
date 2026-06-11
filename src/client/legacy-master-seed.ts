import { keccak_512 } from '@noble/hashes/sha3.js'
import { getUtf8Encoder } from '@solana/kit'
import type { MasterSeed } from '@umbra-privacy/sdk/types'
import type { MasterSeedScheme } from '@umbra-privacy/sdk/master-seed-schemes'

export const UMBRA_MESSAGE_TO_SIGN = `
Umbra Protocol – User Consent & Acknowledgement

Please read carefully before continuing. Umbra is a non-custodial, open-source protocol. Umbra does not hold, control, manage, or access your digital assets, private keys, viewing keys, transactions, or personal data. All interactions with the Umbra protocol occur through autonomous smart contracts and wallet-signed transactions executed directly on the blockchain.

By using the Umbra protocol, you acknowledge and agree that:

1. You are solely responsible for managing your wallet, private keys, privacy settings, viewing key disclosures, and any transactions or interactions you authorize.
2.Blockchain transactions are generally irreversible, and smart contracts may contain bugs, vulnerabilities, or unintended behavior.
3. Errors, misuse, misconfiguration, third-party tools, relayers, or loss of keys may result in permanent and unrecoverable loss of assets or privacy.
4. Privacy features are designed to enhance confidentiality but do not guarantee absolute or unconditional anonymity.
5. Transactions may involve independent relayers or third-party infrastructure that Umbra does not operate, control, or supervise.
6. By clicking "I Agree", you confirm that you have read, understood, and accepted all applicable terms, policies, risk disclosures, notices, and other documentation governing your access to and use of the Umbra protocol, as published or made available by Umbra from time to time.
You acknowledge that such documentation may be updated or modified, and that continued access to or use of the Umbra Protocol constitutes acceptance of the then-current versions. If you do not agree, do not proceed and discontinue use of the Umbra protocol.
`

export const legacyMasterSeedScheme: MasterSeedScheme = {
  id: 'legacy-mobile',
  messageToSign: UMBRA_MESSAGE_TO_SIGN,
  deriveMasterSeed: async (signer, messageToSign) => {
    const messageBytes = new Uint8Array(getUtf8Encoder().encode(messageToSign))
    const signed = await signer.signMessage(messageBytes)
    return keccak_512(signed.signature) as MasterSeed
  }
}
