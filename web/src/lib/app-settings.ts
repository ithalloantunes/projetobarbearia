export const APP_SETTINGS_KEY = "shop_profile";

type DayHour = {
  enabled: boolean;
  open: string;
  close: string;
};

export type ShopSettings = {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  businessHours: Record<string, DayHour>;
  cancellationPolicyMinutes: number;
  cancellationPolicyText: string;
  notificationChannels: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  storefrontHeroImage: string;
  brandPreviewImage: string;
};

const defaultBusinessHours: Record<string, DayHour> = {
  monday: { enabled: true, open: "09:00", close: "20:00" },
  tuesday: { enabled: true, open: "09:00", close: "20:00" },
  wednesday: { enabled: true, open: "09:00", close: "20:00" },
  thursday: { enabled: true, open: "09:00", close: "20:00" },
  friday: { enabled: true, open: "09:00", close: "20:00" },
  saturday: { enabled: true, open: "08:00", close: "18:00" },
  sunday: { enabled: false, open: "09:00", close: "13:00" }
};

export const defaultShopSettings: ShopSettings = {
  businessName: "BarberSaaS Premium",
  phone: "(11) 99999-9999",
  email: "contato@barbersaas.com",
  address: "Av. Paulista, 1000 - Sao Paulo/SP",
  openingHours: "Seg a Sab, 09:00 as 20:00",
  businessHours: defaultBusinessHours,
  cancellationPolicyMinutes: 120,
  cancellationPolicyText:
    "Cancelamentos sem custo ate 2 horas antes do horario marcado.",
  notificationChannels: {
    email: true,
    whatsapp: true,
    sms: false
  },
  socialLinks: {
    instagram: "@barbersaas",
    facebook: "fb.com/barbersaas",
    tiktok: "@barbersaas"
  },
  storefrontHeroImage:
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop",
  brandPreviewImage:
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1200&auto=format&fit=crop"
};

function parseBusinessHours(input: unknown): Record<string, DayHour> {
  if (!input || typeof input !== "object") {
    return defaultBusinessHours;
  }
  const source = input as Record<string, Partial<DayHour>>;
  const result: Record<string, DayHour> = { ...defaultBusinessHours };
  for (const key of Object.keys(defaultBusinessHours)) {
    const day = source[key];
    if (!day) continue;
    result[key] = {
      enabled:
        typeof day.enabled === "boolean" ? day.enabled : defaultBusinessHours[key].enabled,
      open: day.open || defaultBusinessHours[key].open,
      close: day.close || defaultBusinessHours[key].close
    };
  }
  return result;
}

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
      businessHours: parseBusinessHours(parsed.businessHours),
      cancellationPolicyMinutes:
        typeof parsed.cancellationPolicyMinutes === "number"
          ? parsed.cancellationPolicyMinutes
          : defaultShopSettings.cancellationPolicyMinutes,
      cancellationPolicyText:
        parsed.cancellationPolicyText || defaultShopSettings.cancellationPolicyText,
      notificationChannels: {
        email: parsed.notificationChannels?.email ?? defaultShopSettings.notificationChannels.email,
        whatsapp:
          parsed.notificationChannels?.whatsapp ?? defaultShopSettings.notificationChannels.whatsapp,
        sms: parsed.notificationChannels?.sms ?? defaultShopSettings.notificationChannels.sms
      },
      socialLinks: {
        instagram: parsed.socialLinks?.instagram || defaultShopSettings.socialLinks.instagram,
        facebook: parsed.socialLinks?.facebook || defaultShopSettings.socialLinks.facebook,
        tiktok: parsed.socialLinks?.tiktok || defaultShopSettings.socialLinks.tiktok
      },
      storefrontHeroImage:
        parsed.storefrontHeroImage || defaultShopSettings.storefrontHeroImage,
      brandPreviewImage: parsed.brandPreviewImage || defaultShopSettings.brandPreviewImage
    };
  } catch {
    return defaultShopSettings;
  }
}
