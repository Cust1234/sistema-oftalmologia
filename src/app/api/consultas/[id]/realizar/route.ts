import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarToken, obterTokenDaRequest } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = obterTokenDaRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const body = await request.json()
    const { diagnostico, prescricao, exames, retorno, observacoes } = body

    const consulta = await prisma.consulta.update({
      where: { id },
      data: {
        status: 'REALIZADA',
        diagnostico,
        prescricao,
        exames,
        retorno: retorno ? new Date(retorno) : null,
        observacoes
      }
    })

    return NextResponse.json(consulta)
  } catch (error) {
    console.error('Erro ao realizar consulta:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar consulta' },
      { status: 500 }
    )
  }
}