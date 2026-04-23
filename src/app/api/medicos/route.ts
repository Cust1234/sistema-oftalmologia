import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { verificarToken, obterTokenDaRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = obterTokenDaRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const especialidade = searchParams.get('especialidade')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let where: any = {}
    if (especialidade) {
      where.especialidade = { contains: especialidade, mode: 'insensitive' }
    }

    const medicos = await prisma.medico.findMany({
      where,
      include: {
        consultas: {
          where: {
            status: 'AGENDADA',
            dataHora: { gte: new Date() }
          },
          orderBy: { dataHora: 'asc' },
          take: 10
        }
      },
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json(medicos)
  } catch (error) {
    console.error('Erro ao listar médicos:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar médicos' },
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

    const payload = verificarToken(token)
    if (payload?.perfil !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, especialidade, numeroOrdem, telefone, email, horarioTrabalho, diasAtendimento, duracaoConsulta } = body

    // Criar utilizador para o médico
    const senhaHash = await bcrypt.hash('senha123', 10)
    
    const utilizador = await prisma.utilizador.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        perfil: 'MEDICO'
      }
    })

    const medico = await prisma.medico.create({
      data: {
        nome,
        especialidade,
        numeroOrdem,
        telefone,
        email,
        horarioTrabalho,
        diasAtendimento,
        duracaoConsulta,
        idUtilizador: utilizador.id
      }
    })

    return NextResponse.json(medico, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar médico:', error)
    return NextResponse.json(
      { error: 'Erro ao criar médico' },
      { status: 500 }
    )
  }
}