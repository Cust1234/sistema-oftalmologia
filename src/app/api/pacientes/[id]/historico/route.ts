import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarToken, obterTokenDaRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = obterTokenDaRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const id = parseInt(params.id)

    const consultas = await prisma.consulta.findMany({
      where: { idPaciente: id },
      include: {
        medico: true,
        prescricoes: true
      },
      orderBy: { dataHora: 'desc' }
    })

    const prescricoes = await prisma.prescricao.findMany({
      where: {
        consulta: { idPaciente: id }
      },
      include: {
        consulta: {
          include: { medico: true }
        }
      },
      orderBy: { dataPrescricao: 'desc' }
    })

    return NextResponse.json({
      consultas,
      prescricoes,
      totalConsultas: consultas.length,
      totalPrescricoes: prescricoes.length
    })
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar histórico' },
      { status: 500 }
    )
  }
}