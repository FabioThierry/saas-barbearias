import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { canCreateAdmin, canCreateBarber } from "@/lib/user-roles";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Bloquear tentativas de cadastro público para tornar o sistema fechado
  if (pathname.includes("/sign-up") || pathname.includes("/api/auth/sign-up")) {
    // Recusar qualquer tentativa de cadastro público
    return NextResponse.json(
      { error: "Cadastro público desativado. Contate o administrador." },
      { status: 403 }
    );
  }

  // Obter sessão do usuário
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Verificar se a rota requer autenticação
  const protectedPaths = [
    "/dashboard",
    "/admin",
    "/barber",
    "/api/admin",
    "/api/users",
    "/api/barbers",
  ];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    if (!session) {
      // Redirecionar para login se não estiver autenticado
      url.pathname = "/sign-in";
      url.search = `returnTo=${encodeURIComponent(request.url)}`;
      return NextResponse.redirect(url);
    }

    // Buscar o papel do usuário no banco de dados
    const userRecord = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const userRole = userRecord[0].role;

    // Verificar permissões específicas para certas rotas
    if (pathname.includes("/api/admin") || pathname.includes("/admin")) {
      // Apenas super admin pode acessar rotas de administração de admins
      if (!canCreateAdmin(userRole)) {
        return NextResponse.json(
          {
            error:
              "Acesso negado: Apenas super admins podem gerenciar administradores.",
          },
          { status: 403 }
        );
      }
    }

    if (pathname.includes("/api/barbers") || pathname.includes("/barbers")) {
      // Apenas super admin e admin podem gerenciar barbeiros
      if (!canCreateBarber(userRole)) {
        return NextResponse.json(
          {
            error:
              "Acesso negado: Apenas super admins e admins podem gerenciar barbeiros.",
          },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/api/(.*)",
  ],
};
