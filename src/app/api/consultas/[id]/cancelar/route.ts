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
    const { motivo } = body

    const consulta = await prisma.consulta.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        observacoes: motivo ? `Cancelada: ${motivo}` : 'Cancelada'
      }
    })

    return NextResponse.json(consulta)
  } catch (error) {
    console.error('Erro ao cancelar consulta:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar consulta' },
      { status: 500 }
    )
  }
}