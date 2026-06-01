import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import {
  APP_SETTINGS_KEY,
  defaultShopSettings,
  parseShopSettings
} from "@/lib/app-settings";

const updateSchema = z.object({
  businessName: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email(),
  address: z.string().min(5).max(180),
  openingHours: z.string().min(3).max(120),
  businessHours: z.record(
    z.string(),
    z.object({
      enabled: z.boolean(),
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/)
    })
  ),
  cancellationPolicyMinutes: z.number().int().min(0).max(1440),
  cancellationPolicyText: z.string().min(10).max(400),
  notificationChannels: z.object({
    email: z.boolean(),
    whatsapp: z.boolean(),
    sms: z.boolean()
  }),
  socialLinks: z.object({
    instagram: z.string().max(120),
    facebook: z.string().max(120),
    tiktok: z.string().max(120)
  }),
  storefrontHeroImage: z.string().url().max(400),
  brandPreviewImage: z.string().url().max(400)
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: APP_SETTINGS_KEY }
    });
    return NextResponse.json({
      settings: parseShopSettings(setting?.value)
    });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao carregar configuracoes.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function PUT(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const settings = {
      ...defaultShopSettings,
      ...parsed.data
    };

    const appSetting = await prisma.appSetting.upsert({
      where: { key: APP_SETTINGS_KEY },
      update: { value: JSON.stringify(settings) },
      create: {
        key: APP_SETTINGS_KEY,
        value: JSON.stringify(settings)
      }
    });

    return NextResponse.json({
      settings: parseShopSettings(appSetting.value)
    });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao salvar configuracoes.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
