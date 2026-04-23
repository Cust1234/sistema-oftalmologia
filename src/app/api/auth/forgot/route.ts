import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { enviarEmailRecuperacao } from '@/lib/mail'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      )
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: { email }
    })

    if (!utilizador) {
      // Por segurança, não revelar se o e-mail existe
      return NextResponse.json({
        success: true,
        message: 'Se o e-mail existir, enviaremos instruções de recuperação'
      })
    }

    // Gerar token de recuperação
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date()
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Expira em 1 hora

    await prisma.utilizador.update({
      where: { id: utilizador.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Enviar e-mail com link de recuperação
    const resetLink = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${resetToken}`
    await enviarEmailRecuperacao(email, resetLink)

    return NextResponse.json({
      success: true,
      message: 'Instruções de recuperação enviadas para o seu e-mail'
    })
  } catch (error) {
    console.error('Erro na recuperação de senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}