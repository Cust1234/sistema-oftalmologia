import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'

export interface TokenPayload {
  id: number
  email: string
  perfil: string
}

export function gerarToken(utilizador: TokenPayload): string {
  return jwt.sign(utilizador, process.env.JWT_SECRET!, { expiresIn: '8h' })
}

export function verificarToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
  } catch {
    return null
  }
}

export function obterTokenDaRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  return authHeader?.replace('Bearer ', '') || null
}

export async function getUtilizadorFromToken(token: string) {
  const payload = verificarToken(token)
  if (!payload) return null
  
  return await prisma.utilizador.findUnique({
    where: { id: payload.id }
  })
}

export function verificarPerfil(permitidos: string[]) {
  return (req: NextRequest, perfil: string) => {
    if (!permitidos.includes(perfil)) {
      return NextResponse.json(
        { error: 'Acesso negado. Perfil não autorizado.' },
        { status: 403 }
      )
    }
    return null
  }
}