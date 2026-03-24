import { Prisma } from "@prisma/client";

type ApiErrorResult = {
  status: number;
  message: string;
};

function isDbUnavailableMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("can't reach database server") ||
    normalized.includes("cant reach database server") ||
    normalized.includes("database server")
  );
}

export function mapApiError(error: unknown, fallbackMessage: string): ApiErrorResult {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return {
      status: 503,
      message: "Banco de dados indisponivel. Inicie o MySQL em localhost:3307 e tente novamente."
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return {
        status: 404,
        message: "Registro nao encontrado."
      };
    }
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(",") : String(error.meta?.target || "");
      const normalizedTarget = target.toLowerCase();
      if (normalizedTarget.includes("email") || normalizedTarget.includes("phone")) {
        return {
          status: 409,
          message: "Email ou telefone ja cadastrado."
        };
      }
      return {
        status: 409,
        message: "Registro ja existente."
      };
    }
    return {
      status: 400,
      message: "Nao foi possivel processar a solicitacao."
    };
  }

  if (error instanceof Error) {
    if (isDbUnavailableMessage(error.message)) {
      return {
        status: 503,
        message: "Banco de dados indisponivel. Inicie o MySQL em localhost:3307 e tente novamente."
      };
    }

    return {
      status: 400,
      message: error.message
    };
  }

  return {
    status: 500,
    message: fallbackMessage
  };
}
