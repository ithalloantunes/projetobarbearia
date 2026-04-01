require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");

const databaseUrl =
  process.env.DATABASE_URL ||
  "mysql://barbersaas:barbersaas@localhost:3307/barbersaas";
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(databaseUrl)
});

async function upsertService(data) {
  return prisma.service.upsert({
    where: { name: data.name },
    update: {
      description: data.description,
      imageUrl: data.imageUrl,
      price: data.price,
      durationMinutes: data.durationMinutes,
      status: "ACTIVE"
    },
    create: {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      price: data.price,
      durationMinutes: data.durationMinutes,
      status: "ACTIVE"
    }
  });
}

async function main() {
  let seedPassword = process.env.SEED_DEFAULT_PASSWORD;
  if (!seedPassword) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SEED_DEFAULT_PASSWORD nao definido.");
    }
    seedPassword = crypto.randomBytes(9).toString("base64url");
    console.warn("SEED_DEFAULT_PASSWORD nao definido. Senha gerada:", seedPassword);
  }

  const defaultPasswordHash = await bcrypt.hash(seedPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@barbersaas.com" },
    update: {
      name: "Administrador",
      phone: "11999990000",
      passwordHash: defaultPasswordHash,
      status: "ACTIVE"
    },
    create: {
      name: "Administrador",
      email: "admin@barbersaas.com",
      phone: "11999990000",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      status: "ACTIVE"
    }
  });

  const client = await prisma.user.upsert({
    where: { email: "cliente@barbersaas.com" },
    update: {
      name: "Cliente Demo",
      phone: "11999991111",
      passwordHash: defaultPasswordHash,
      status: "ACTIVE"
    },
    create: {
      name: "Cliente Demo",
      email: "cliente@barbersaas.com",
      phone: "11999991111",
      passwordHash: defaultPasswordHash,
      role: "CLIENT",
      status: "ACTIVE"
    }
  });

  const services = await Promise.all([
    upsertService({
      name: "Corte de Cabelo",
      description: "Corte degrade, tesoura ou maquina",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCMQXoMJpEXYe-09-PViitmOc4UC0tIF920NNirOrT8fC2rOHsxAKU34Qm5U9REuWVqDTuTlEy6z6t01j4loZjshdCO34DRo8USrCz7jX0kYHGa6ACwP3Aw9GGgU96lHlxT4ZM2bOHcIPb8BlRVEiWFRWXdKhIl6N-y1utedqPZo4-UCqbPmUQm_MNsJFkB3o1fkNKsvTN9iiI6W8Folo7Mi5p-bSvxw_WxYisbEP05pvzQQ0TIGbPnfAGoUk1I8y8FmVyJFGX-gd7D",
      price: 65,
      durationMinutes: 45
    }),
    upsertService({
      name: "Barba Terapia",
      description: "Toalha quente e massagem facial",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCbtsyLhkpOZjbGyzKKXOHzdvUi3AQ5QNYo2pDyIGiDGgR8OUUlifbD4Gn8ysfXpbV5OONrXA1AodDsVF4rTXIRjjxkGculKez4Qvlid9wYj1JBz1LWeW03vw0px7KHOjHFAx_3YruYsQq-jBjHHlrcysPM5mdlD32UHl1eZGjdSuGigCrbCKQtWPtsZQRDid0eOa-WU1T44w6GVlX6_GuAuIOvXjxPOTpfPdULmOdb7oRcmN5OqO2AT-W59gsLyT4M3P-4ps7vrBrK",
      price: 45,
      durationMinutes: 30
    }),
    upsertService({
      name: "Combo Premium",
      description: "Cabelo + Barba + Sobrancelha",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC8Va2is8ISU4XngYiHm9QWAYeRFRjQZaHLIE-zdP-b8G0fYkgl-aYb81kCzViwQwnPYK-MmeKGmtz-bYhWQvLPeivJjPx-Dn-mDM80Z0UBWX-68os3woyt2fWGI6Mnx2EWyR4rWZnQ_LJBZ4xa_HiYBwDVnhMCkyf0K5BTP6ihtRKdm8ou2DueaYzanh803Cwn6sxSltLJW1BjTzXZaT98rp7LIHWJH7xF32H6pfsYcxstbjCCma1gaNbMrun49k3cY7ntKKc_QLlc",
      price: 100,
      durationMinutes: 90
    }),
    upsertService({
      name: "Sobrancelha",
      description: "Design com navalha ou pinca",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAu4ahIxJtSP4KaVvRRKZGWlD3STO5_NpA8uYaO-cS0LaC16D1982jqcM04xnyfrOg5KablgB8g7UXELJ5zeM4Ezb9rthtJ3eo3uPLDimtLYbDN8Xn67380J0btv_9SIiDLU7iVliuZiHd_dg40Mew2AwM4KKItxCfK4F_qnCQode7Llww9aqySqoBvOn8owbvGnsQGOyN3hOzNPE7oPoYNWa_6gjpLBMcuoXKqOA6K7CMiZdDPxyi9PzxX4EamstnCH_eRh0gUfDOt",
      price: 20,
      durationMinutes: 15
    })
  ]);

  const barberProfiles = [
    {
      name: "Ricardo Silva",
      specialty: "Master Barber",
      email: "ricardo@barbersaas.com",
      phone: "11911110001",
      photoUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAREegdVaXsBUUQmoQDvTxd9KXaJAT07fJYl8i19O2v1RZ0jUtYcO_6DlxvwjuTNfgCnol7KdBOESlHBmqIHafNGg1mzbXkC5bNMRAD_sFhLk07jae67AuxGUBbjy18a8eiPA_Y3vuOA_QaQLDhFE8ZBDMV1GxlIpU-_KZbv32-jNmLQyl-jPwvXS0pDpQa8X4V2cValWyYzPUXCsh9mdfed1NnBb8WFBhgMnwflJDv1w-3tElW8ZTqfrwe6s61j0-UvlRR_5DJgIE6"
    },
    {
      name: "Bruno Santos",
      specialty: "Especialista em Barba",
      email: "bruno@barbersaas.com",
      phone: "11911110002",
      photoUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB2TRsZAJVBGwwgMH7l7GNYm5V2pm_x-INuF0K-MUFwJGPKl23yU3igonxYr--OWRTydh35btSzXmumKltqKpOeH8nlQWmFc4-WyabY9IkjKj76N5JMpYMMJvgh1MKKVItbO0xL2zmL_d34Ro6zQRNicphJXYhjhFVPp88SnOTY53rav5L92XqdFy6werwTup8RBCQnIyg8Zy-5GUd8BvM1J9yuxDx_mDH44xKhWir33s19G1Km7xQXIjZe4o13711kUnjzzG6yLNP8"
    },
    {
      name: "Lucas Mendes",
      specialty: "Cortes Modernos",
      email: "lucas@barbersaas.com",
      phone: "11911110003",
      photoUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDorueTl6dH1IvBf0PRyesRFr-4mMUt_xLYBBYk3T8O9BowxOJvtrAszXEF-HftOXVZ7qLhcMFMxrOklw0Y_xxUUYGTSH4YcVTy-OWt8904gR6X6JvnUTsKUnF_bHLZ5mypBQaljX3oLg0T7T1txFdASA4dwQCLvD2PvFm-aCV1nSWTudkWGpF3p4QZs-4vasExAfU_-5k7x3FKQumojMt3XiUVVi5xH9gHyLH07YxZZ85OAnph35LW_skbjbsZrAU_xuTDL_u_Rgpb"
    }
  ];

  const barbers = [];
  for (const profile of barberProfiles) {
    const barberUser = await prisma.user.upsert({
      where: { email: profile.email.toLowerCase() },
      update: {
        name: profile.name,
        phone: profile.phone,
        role: "BARBER",
        passwordHash: defaultPasswordHash,
        status: "ACTIVE"
      },
      create: {
        name: profile.name,
        email: profile.email.toLowerCase(),
        phone: profile.phone,
        passwordHash: defaultPasswordHash,
        role: "BARBER",
        status: "ACTIVE"
      }
    });

    const barber = await prisma.barber.upsert({
      where: { email: profile.email.toLowerCase() },
      update: {
        name: profile.name,
        specialty: profile.specialty,
        phone: profile.phone,
        photoUrl: profile.photoUrl,
        status: "ACTIVE",
        userId: barberUser.id
      },
      create: {
        name: profile.name,
        specialty: profile.specialty,
        email: profile.email.toLowerCase(),
        phone: profile.phone,
        photoUrl: profile.photoUrl,
        status: "ACTIVE",
        userId: barberUser.id
      }
    });

    barbers.push(barber);
  }

  for (const barber of barbers) {
    for (const service of services) {
      await prisma.barberService.upsert({
        where: {
          barberId_serviceId: {
            barberId: barber.id,
            serviceId: service.id
          }
        },
        update: {},
        create: {
          barberId: barber.id,
          serviceId: service.id
        }
      });
    }
  }

  const availabilityTemplate = [
    { dayOfWeek: 1, start: "09:00:00", end: "20:00:00" },
    { dayOfWeek: 2, start: "09:00:00", end: "20:00:00" },
    { dayOfWeek: 3, start: "09:00:00", end: "20:00:00" },
    { dayOfWeek: 4, start: "09:00:00", end: "20:00:00" },
    { dayOfWeek: 5, start: "09:00:00", end: "20:00:00" },
    { dayOfWeek: 6, start: "08:00:00", end: "18:00:00" }
  ];

  for (const barber of barbers) {
    for (const slot of availabilityTemplate) {
      await prisma.availability.upsert({
        where: {
          barberId_dayOfWeek_startTime_endTime: {
            barberId: barber.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: new Date(`1970-01-01T${slot.start}`),
            endTime: new Date(`1970-01-01T${slot.end}`)
          }
        },
        update: {},
        create: {
          barberId: barber.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: new Date(`1970-01-01T${slot.start}`),
          endTime: new Date(`1970-01-01T${slot.end}`)
        }
      });
    }
  }

  await prisma.appSetting.upsert({
    where: { key: "shop_profile" },
    update: {
      value: JSON.stringify({
        businessName: "BarberSaaS Premium",
        phone: "(11) 99999-9999",
        email: "contato@barbersaas.com",
        address: "Av. Paulista, 1000 - Sao Paulo/SP",
        openingHours: "Seg a Sab, 09:00 as 20:00",
        cancellationPolicyMinutes: 120
      })
    },
    create: {
      key: "shop_profile",
      value: JSON.stringify({
        businessName: "BarberSaaS Premium",
        phone: "(11) 99999-9999",
        email: "contato@barbersaas.com",
        address: "Av. Paulista, 1000 - Sao Paulo/SP",
        openingHours: "Seg a Sab, 09:00 as 20:00",
        cancellationPolicyMinutes: 120
      })
    }
  });

  console.log("Seed concluido", {
    admin: admin.email,
    client: client.email,
    barberLogins: barberProfiles.map((item) => item.email)
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
