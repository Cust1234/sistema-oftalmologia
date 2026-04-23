import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarToken, obterTokenDaRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = obterTokenDaRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { idConsulta, medicamento, dosagem, instrucoes, quantidade, validade } = body

    if (!idConsulta || !medicamento || !dosagem) {
      return NextResponse.json(
        { error: 'Consulta, medicamento e dosagem são obrigatórios' },
        { status: 400 }
      )
    }

    const prescricao = await prisma.prescricao.create({
      data: {
        idConsulta: parseInt(idConsulta),
        medicamento,
        dosagem,
        instrucoes,
        quantidade,
        validade: validade ? new Date(validade) : null
      },
      include: {
        consulta: {
          include: {
            paciente: true,
            medico: true
          }
        }
      }
    })

    // Actualizar prescrição na consulta
    await prisma.consulta.update({
      where: { id: parseInt(idConsulta) },
      data: { prescricao: medicamento }
    })

    return NextResponse.json(prescricao, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar prescrição:', error)
    return NextResponse.json(
      { error: 'Erro ao criar prescrição' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = obterTokenDaRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const idConsulta = searchParams.get('idConsulta')
    const idPaciente = searchParams.get('idPaciente')

    let where: any = {}

    if (idConsulta) {
      where.idConsulta = parseInt(idConsulta)
    }

    if (idPaciente) {
      where.consulta = { idPaciente: parseInt(idPaciente) }
    }

    const prescricoes = await prisma.prescricao.findMany({
      where,
      include: {
        consulta: {
          include: {
            paciente: true,
            medico: true
          }
        }
      },
      orderBy: { dataPrescricao: 'desc' }
    })

    return NextResponse.json(prescricoes)
  } catch (error) {
    console.error('Erro ao listar prescrições:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar prescrições' },
      { status: 500 }
    )
  }
}