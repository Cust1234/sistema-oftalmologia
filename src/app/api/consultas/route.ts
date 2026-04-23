import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verificarToken, obterTokenDaRequest } from '@/lib/auth'
import { enviarNotificacaoConsulta } from '@/lib/notificacoes'

export async function GET(request: NextRequest) {
  try {
    const token = obterTokenDaRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const payload = verificarToken(token)
    const { searchParams } = new URL(request.url)
    const data = searchParams.get('data')
    const idMedico = searchParams.get('idMedico')
    const idPaciente = searchParams.get('idPaciente')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let where: any = {}

    if (payload?.perfil === 'MEDICO') {
      const medico = await prisma.medico.findFirst({
        where: { idUtilizador: payload.id }
      })
      if (medico) where.idMedico = medico.id
    }

    if (payload?.perfil === 'PACIENTE') {
      const paciente = await prisma.paciente.findFirst({
        where: { idUtilizador: payload.id }
      })
      if (paciente) where.idPaciente = paciente.id
    }

    if (idMedico) where.idMedico = parseInt(idMedico)
    if (idPaciente) where.idPaciente = parseInt(idPaciente)
    if (status) where.status = status

    if (data) {
      const dataInicio = new Date(data)
      const dataFim = new Date(data)
      dataFim.setDate(dataFim.getDate() + 1)
      where.dataHora = {
        gte: dataInicio,
        lt: dataFim
      }
    }

    const consultas = await prisma.consulta.findMany({
      where,
      include: {
        paciente: true,
        medico: true,
        prescricoes: true
      },
      orderBy: { dataHora: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.consulta.count({ where })

    return NextResponse.json({
      consultas,
      paginacao: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Erro ao listar consultas:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar consultas' },
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
    const { idPaciente, idMedico, dataHora, observacoes } = body

    // Validar campos
    if (!idPaciente || !idMedico || !dataHora) {
      return NextResponse.json(
        { error: 'Paciente, médico e data/hora são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar disponibilidade
    const consultaExistente = await prisma.consulta.findFirst({
      where: {
        idMedico: parseInt(idMedico),
        dataHora: new Date(dataHora),
        status: 'AGENDADA'
      }
    })

    if (consultaExistente) {
      return NextResponse.json(
        { error: 'Horário já ocupado' },
        { status: 409 }
      )
    }

    // Verificar se médico atende neste horário
    const diaSemana = new Date(dataHora).getDay()
    const medico = await prisma.medico.findUnique({
      where: { id: parseInt(idMedico) }
    })

    if (medico?.diasAtendimento) {
      const diasPermitidos = medico.diasAtendimento.split(',')
      const diasMap = { 0: 'DOM', 1: 'SEG', 2: 'TER', 3: 'QUA', 4: 'QUI', 5: 'SEX', 6: 'SAB' }
      const diaSemanaStr = diasMap[diaSemana as keyof typeof diasMap]
      
      if (!diasPermitidos.includes(diaSemanaStr)) {
        return NextResponse.json(
          { error: 'Médico não atende neste dia da semana' },
          { status: 400 }
        )
      }
    }

    const consulta = await prisma.consulta.create({
      data: {
        idPaciente: parseInt(idPaciente),
        idMedico: parseInt(idMedico),
        dataHora: new Date(dataHora),
        status: 'AGENDADA',
        observacoes
      },
      include: {
        paciente: true,
        medico: true
      }
    })

    // Enviar notificação
    await enviarNotificacaoConsulta(consulta)

    return NextResponse.json(consulta, { status: 201 })
  } catch (error) {
    console.error('Erro ao agendar consulta:', error)
    return NextResponse.json(
      { error: 'Erro ao agendar consulta' },
      { status: 500 }
    )
  }
}