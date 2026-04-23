import { NextRequest, NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'

const rotasPublicas = ['/login', '/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas (não precisam de autenticação)
  if (rotasPublicas.some(rota => pathname.startsWith(rota))) {
    return NextResponse.next()
  }

  // Verificar token
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = verificarToken(token)
  if (!payload) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
}