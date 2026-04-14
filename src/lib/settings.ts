import { client } from "@/sanity/lib/client"

export interface StoreSettings {
  shippingAdoEkiti: number;
  shippingEkitiState: number;
  shippingOutsideEkiti: number;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const settings = await client.fetch<StoreSettings>(`
    *[_id == "storeSettings_singleton"][0] {
      shippingAdoEkiti,
      shippingEkitiState,
      shippingOutsideEkiti,
      bankName,
      accountName,
      accountNumber
    }
  `)

  // Return sensible defaults if the settings haven't been created in Sanity yet.
  return settings || {
    shippingAdoEkiti: 2000,
    shippingEkitiState: 4000,
    shippingOutsideEkiti: 8000,
    bankName: '',
    accountName: '',
    accountNumber: '',
  }
}
