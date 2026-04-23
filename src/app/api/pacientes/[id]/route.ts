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
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        consultas: {
          include: {
            medico: true,
            prescricoes: true
          },
          orderBy: { dataHora: 'desc' }
        }
      }
    })

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    return NextResponse.json(paciente)
  } catch (error) {
    console.error('Erro ao buscar paciente:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar paciente' },
      { status: 500 }
    )
  }
}

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

    const paciente = await prisma.paciente.update({
      where: { id },
      data: {
        nome: body.nome,
        dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
        sexo: body.sexo,
        telefone: body.telefone,
        telefoneAlternativo: body.telefoneAlternativo,
        endereco: body.endereco,
        email: body.email,
        alergias: body.alergias,
        doencasCronicas: body.doencasCronicas,
        medicamentosUso: body.medicamentosUso
      }
    })

    return NextResponse.json(paciente)
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar paciente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = obterTokenDaRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const id = parseInt(params.id)

    // Verificar se tem consultas
    const consultas = await prisma.consulta.count({
      where: { idPaciente: id }
    })

    if (consultas > 0) {
      // Em vez de eliminar, desativar
      return NextResponse.json(
        { error: 'Paciente tem consultas registadas. Não pode ser eliminado.' },
        { status: 400 }
      )
    }

    await prisma.paciente.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao eliminar paciente:', error)
    return NextResponse.json(
      { error: 'Erro ao eliminar paciente' },
      { status: 500 }
    )
  }
}