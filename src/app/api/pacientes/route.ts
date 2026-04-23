import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarToken, obterTokenDaRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = obterTokenDaRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const payload = verificarToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const nome = searchParams.get('nome')
    const telefone = searchParams.get('telefone')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    let where: any = {}

    if (nome) {
      where.nome = { contains: nome, mode: 'insensitive' }
    }
    if (telefone) {
      where.telefone = { contains: telefone }
    }

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        include: {
          consultas: {
            orderBy: { dataHora: 'desc' },
            take: 5
          }
        },
        orderBy: { nome: 'asc' },
        skip,
        take: limit
      }),
      prisma.paciente.count({ where })
    ])

    return NextResponse.json({
      pacientes,
      paginacao: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Erro ao listar pacientes:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar pacientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = obterTokenDaRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, dataNascimento, sexo, telefone, telefoneAlternativo, endereco, email, alergias, doencasCronicas, medicamentosUso } = body

    // Validar campos obrigatórios
    if (!nome || !telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se paciente já existe
    const existe = await prisma.paciente.findFirst({
      where: { telefone }
    })

    if (existe) {
      return NextResponse.json(
        { error: 'Já existe um paciente com este telefone' },
        { status: 409 }
      )
    }

    const paciente = await prisma.paciente.create({
      data: {
        nome,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        sexo,
        telefone,
        telefoneAlternativo,
        endereco,
        email,
        alergias,
        doencasCronicas,
        medicamentosUso
      }
    })

    return NextResponse.json(paciente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar paciente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar paciente' },
      { status: 500 }
    )
  }
}