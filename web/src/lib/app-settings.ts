export const APP_SETTINGS_KEY = "shop_profile";

export type ShopSettings = {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  cancellationPolicyMinutes: number;
};

export const defaultShopSettings: ShopSettings = {
  businessName: "BarberSaaS Premium",
  phone: "(11) 99999-9999",
  email: "contato@barbersaas.com",
  address: "Av. Paulista, 1000 - Sao Paulo/SP",
  openingHours: "Seg a Sab, 09:00 as 20:00",
  cancellationPolicyMinutes: 120
};

export function parseShopSettings(value: string | null | undefined): ShopSettings {
  if (!value) return defaultShopSettings;
  try {
    const parsed = JSON.parse(value) as Partial<ShopSettings>;
    return {
      businessName: parsed.businessName || defaultShopSettings.businessName,
      phone: parsed.phone || defaultShopSettings.phone,
      email: parsed.email || defaultShopSettings.email,
      address: parsed.address || defaultShopSettings.address,
      openingHours: parsed.openingHours || defaultShopSettings.openingHours,
      cancellationPolicyMinutes:
        typeof parsed.cancellationPolicyMinutes === "number"
          ? parsed.cancellationPolicyMinutes
          : defaultShopSettings.cancellationPolicyMinutes
    };
  } catch {
    return defaultShopSettings;
  }
}
