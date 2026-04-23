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

    const medico = await prisma.medico.findUnique({
      where: { id },
      include: {
        consultas: {
          include: {
            paciente: true
          },
          orderBy: { dataHora: 'desc' },
          take: 10
        },
        utilizador: true
      }
    })

    if (!medico) {
      return NextResponse.json({ error: 'Médico não encontrado' }, { status: 404 })
    }

    return NextResponse.json(medico)
  } catch (error) {
    console.error('Erro ao buscar médico:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar médico' },
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

    const payload = verificarToken(token)
    if (payload?.perfil !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const id = parseInt(params.id)
    const body = await request.json()
    const { nome, especialidade, numeroOrdem, telefone, email, horarioTrabalho, diasAtendimento, duracaoConsulta } = body

    const medico = await prisma.medico.update({
      where: { id },
      data: {
        nome,
        especialidade,
        numeroOrdem,
        telefone,
        email,
        horarioTrabalho,
        diasAtendimento,
        duracaoConsulta
      }
    })

    // Actualizar também o utilizador associado
    if (medico.idUtilizador) {
      await prisma.utilizador.update({
        where: { id: medico.idUtilizador },
        data: { nome, email }
      })
    }

    return NextResponse.json(medico)
  } catch (error) {
    console.error('Erro ao atualizar médico:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar médico' },
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

    const payload = verificarToken(token)
    if (payload?.perfil !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const id = parseInt(params.id)

    // Verificar se tem consultas
    const consultas = await prisma.consulta.count({
      where: { idMedico: id }
    })

    if (consultas > 0) {
      return NextResponse.json(
        { error: 'Médico tem consultas registadas. Não pode ser eliminado.' },
        { status: 400 }
      )
    }

    const medico = await prisma.medico.findUnique({ where: { id } })
    
    await prisma.medico.delete({ where: { id } })

    // Eliminar também o utilizador associado
    if (medico?.idUtilizador) {
      await prisma.utilizador.delete({ where: { id: medico.idUtilizador } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao eliminar médico:', error)
    return NextResponse.json(
      { error: 'Erro ao eliminar médico' },
      { status: 500 }
    )
  }
}