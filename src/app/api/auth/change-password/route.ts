import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verificarToken, obterTokenDaRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = obterTokenDaRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const payload = verificarToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { senhaActual, novaSenha } = await request.json()

    if (!senhaActual || !novaSenha) {
      return NextResponse.json(
        { error: 'Senha actual e nova senha são obrigatórias' },
        { status: 400 }
      )
    }

    if (novaSenha.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: { id: payload.id }
    })

    if (!utilizador) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }

    const senhaValida = await bcrypt.compare(senhaActual, utilizador.senha)
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Senha actual incorrecta' },
        { status: 401 }
      )
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10)

    await prisma.utilizador.update({
      where: { id: payload.id },
      data: { senha: novaSenhaHash }
    })

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}