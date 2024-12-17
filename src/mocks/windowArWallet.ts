import Transaction from 'arweave/web/lib/transaction'
import { JSDOM } from 'jsdom'

const _Window = (new JSDOM() as any).window as Window

const arweaveWallet = {
  getActiveAddress: jest.fn(() => 'owtC4zvNF_S2C42-Rb-PC1vuuF6bzcqIUlmQvd-Bo50'),
  getActivePublicKey: jest.fn(
    () =>
      'ramEa6C2eLOezPlIIG5i2BMkCQVEG6rL5hWrKwV0rDAld2OzrNyKj8MiHMrJ_Jw8q4f_ptRGqfp5hTl5fKEgPD-zJh2ZQbfAsVDADWxh8a_zCUQQ96t6I0bdzt4Ga48COyGppHPzlAY1iwwB1Lt_Bu-Sh4TSZFzmnO1pi4urKUV1iZXKQC15K0e4zxa-iohjoHn8Rfkp5H2EeYSoE8f4PKQtAxY5bXXkOKDslFWSw6ZwU64T_XGXUpi9QGIPE0FabVvohG9LsOn5DuCKrZgKCShko_7f47b2KJqd-GqFHKhb4HEcQ_tifSR3tQZs40bqYW5r99J6n0KOGCd-era2yetkgK-LfMTALynhZfzICyZBv86w8xA-zqQ8Hgb_ezTC4bKnLkX2YZyASB_WRI86q3OTdlBNMaEkIxCeRwT4hcjjJxNJkyr8fuIYdqVR96ECgAWqPcvyK1_6C9Xqqt-ypJj1Ar3vQaGUk7kXENzEcbpXNdYEMpOAwphq5TKszjs8j457xHhjzFU7la1FTLiagNx_wsgVLQutpTNHG6LxrRPvVzD2MLwJ_IQV_cbMgGH61wkTl76KrPeBrAd-BGt8UjinsfOz9OH5eUFdeCJIbajyppgC76eDP-fVYw2kqxmXK27CCUEMWlFFH1ko8aCiYoVW5z3mNF5CuziYOY4vFRM'
  ),
  dispatch: jest.fn((tx: Transaction) => Promise.resolve(tx.id)),
  privateHash: jest.fn((_: Uint8Array, __: { hashAlgorithm: string }) =>
    Promise.resolve(Buffer.from('3f9c3ab790de97e82a9195ac525c4961bba4dfbf418a6649e9022509983c1d54', 'hex'))
  )
}

Object.defineProperty(_Window, 'arweaveWallet', {
  value: arweaveWallet
})

export { _Window, arweaveWallet }
