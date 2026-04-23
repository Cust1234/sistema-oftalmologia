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
    if (payload?.perfil !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') // consultas, pacientes, medicos, financeiro, dashboard
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    // ==================== DASHBOARD GERAL ====================
    if (tipo === 'dashboard' || !tipo) {
      const [
        totalPacientes,
        totalMedicos,
        consultasHoje,
        consultasAgendadas,
        consultasRealizadas,
        consultasCanceladas,
        consultasHojeLista
      ] = await Promise.all([
        prisma.paciente.count(),
        prisma.medico.count(),
        prisma.consulta.count({
          where: {
            dataHora: {
              gte: new Date(),
              lt: new Date(new Date().setDate(new Date().getDate() + 1))
            }
          }
        }),
        prisma.consulta.count({ where: { status: 'AGENDADA' } }),
        prisma.consulta.count({ where: { status: 'REALIZADA' } }),
        prisma.consulta.count({ where: { status: 'CANCELADA' } }),
        prisma.consulta.findMany({
          where: {
            dataHora: {
              gte: new Date(),
              lt: new Date(new Date().setDate(new Date().getDate() + 1))
            }
          },
          include: {
            paciente: true,
            medico: true
          },
          orderBy: { dataHora: 'asc' }
        })
      ])

      return NextResponse.json({
        totalPacientes,
        totalMedicos,
        consultasHoje,
        consultasAgendadas,
        consultasRealizadas,
        consultasCanceladas,
        consultasHojeLista
      })
    }

    // ==================== RELATÓRIO DE CONSULTAS ====================
    if (tipo === 'consultas') {
      let whereConsulta: any = {}

      if (dataInicio && dataFim) {
        whereConsulta.dataHora = {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        }
      }

      const [consultasPorStatus, consultasPorMes, consultasPorMedico, consultasPorDia] = await Promise.all([
        prisma.consulta.groupBy({
          by: ['status'],
          where: whereConsulta,
          _count: true
        }),
        prisma.$queryRaw`
          SELECT DATE_TRUNC('month', data_hora) as mes, COUNT(*) as total
          FROM consultas
          WHERE data_hora IS NOT NULL
          GROUP BY DATE_TRUNC('month', data_hora)
          ORDER BY mes DESC
          LIMIT 12
        `,
        prisma.consulta.groupBy({
          by: ['idMedico'],
          where: { ...whereConsulta, status: 'REALIZADA' },
          _count: true
        }),
        prisma.$queryRaw`
          SELECT DATE_TRUNC('day', data_hora) as dia, COUNT(*) as total
          FROM consultas
          WHERE data_hora IS NOT NULL
          GROUP BY DATE_TRUNC('day', data_hora)
          ORDER BY dia DESC
          LIMIT 30
        `
      ])

      const medicos = await prisma.medico.findMany({
        select: { id: true, nome: true, especialidade: true }
      })

      const consultasPorMedicoDetalhado = consultasPorMedico.map(item => ({
        medico: medicos.find(m => m.id === item.idMedico)?.nome || 'Desconhecido',
        especialidade: medicos.find(m => m.id === item.idMedico)?.especialidade || '',
        total: item._count
      }))

      return NextResponse.json({
        consultasPorStatus,
        consultasPorMes,
        consultasPorMedico: consultasPorMedicoDetalhado,
        consultasPorDia
      })
    }

    // ==================== RELATÓRIO DE PACIENTES ====================
    if (tipo === 'pacientes') {
      const [totalPacientes, pacientesPorMes, pacientesPorSexo, pacientesPorDistrito] = await Promise.all([
        prisma.paciente.count(),
        prisma.$queryRaw`
          SELECT DATE_TRUNC('month', data_criacao) as mes, COUNT(*) as total
          FROM pacientes
          GROUP BY DATE_TRUNC('month', data_criacao)
          ORDER BY mes DESC
          LIMIT 12
        `,
        prisma.paciente.groupBy({
          by: ['sexo'],
          _count: true
        }),
        prisma.$queryRaw`
          SELECT endereco as distrito, COUNT(*) as total
          FROM pacientes
          WHERE endereco IS NOT NULL AND endereco != ''
          GROUP BY endereco
          ORDER BY total DESC
          LIMIT 10
        `
      ])

      const pacientesPorIdade = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN DATE_PART('year', AGE(data_nascimento)) < 18 THEN '0-17'
            WHEN DATE_PART('year', AGE(data_nascimento)) BETWEEN 18 AND 30 THEN '18-30'
            WHEN DATE_PART('year', AGE(data_nascimento)) BETWEEN 31 AND 50 THEN '31-50'
            WHEN DATE_PART('year', AGE(data_nascimento)) > 50 THEN '50+'
            ELSE 'Desconhecido'
          END as faixa_etaria,
          COUNT(*) as total
        FROM pacientes
        GROUP BY faixa_etaria
      `

      return NextResponse.json({
        totalPacientes,
        pacientesPorMes,
        pacientesPorSexo,
        pacientesPorDistrito,
        pacientesPorIdade
      })
    }

    // ==================== RELATÓRIO DE MÉDICOS ====================
    if (tipo === 'medicos') {
      const [medicosPorEspecialidade, totalMedicos, consultasPorMedicoLista, medicosTop] = await Promise.all([
        prisma.medico.groupBy({
          by: ['especialidade'],
          _count: true
        }),
        prisma.medico.count(),
        prisma.consulta.groupBy({
          by: ['idMedico'],
          where: { status: 'REALIZADA' },
          _count: true
        }),
        prisma.$queryRaw`
          SELECT m.id, m.nome, m.especialidade, COUNT(c.id) as total_consultas
          FROM medicos m
          LEFT JOIN consultas c ON c.id_medico = m.id AND c.status = 'REALIZADA'
          GROUP BY m.id, m.nome, m.especialidade
          ORDER BY total_consultas DESC
          LIMIT 5
        `
      ])

      return NextResponse.json({
        totalMedicos,
        medicosPorEspecialidade,
        consultasPorMedico: consultasPorMedicoLista,
        medicosTop
      })
    }

    // ==================== RELATÓRIO FINANCEIRO ====================
    if (tipo === 'financeiro') {
      let wherePagamento: any = {}

      if (dataInicio && dataFim) {
        wherePagamento.dataPagamento = {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        }
      }

      const [totalReceitas, pagamentosPorForma, pagamentosPorMes, pagamentosPendentes] = await Promise.all([
        prisma.pagamento.aggregate({
          where: { ...wherePagamento, status: 'PAGO' },
          _sum: { valor: true }
        }),
        prisma.pagamento.groupBy({
          by: ['formaPagamento'],
          where: wherePagamento,
          _sum: { valor: true },
          _count: true
        }),
        prisma.$queryRaw`
          SELECT DATE_TRUNC('month', data_pagamento) as mes, SUM(valor) as total
          FROM pagamentos
          WHERE status = 'PAGO'
          GROUP BY DATE_TRUNC('month', data_pagamento)
          ORDER BY mes DESC
          LIMIT 12
        `,
        prisma.pagamento.count({
          where: { status: 'PENDENTE' }
        })
      ])

      const pagamentosDetalhados = await prisma.pagamento.findMany({
        where: wherePagamento,
        include: {
          consulta: {
            include: {
              paciente: true,
              medico: true
            }
          }
        },
        orderBy: { dataPagamento: 'desc' },
        take: 100
      })

      return NextResponse.json({
        totalReceitas: totalReceitas._sum.valor || 0,
        pagamentosPendentes,
        pagamentosPorForma,
        pagamentosPorMes,
        pagamentosDetalhados
      })
    }

    // ==================== RELATÓRIO DE AGENDA ====================
    if (tipo === 'agenda') {
      const data = searchParams.get('data') || new Date().toISOString().split('T')[0]
      const dataInicioConsulta = new Date(data)
      const dataFimConsulta = new Date(data)
      dataFimConsulta.setDate(dataFimConsulta.getDate() + 1)

      const consultasDoDia = await prisma.consulta.findMany({
        where: {
          dataHora: {
            gte: dataInicioConsulta,
            lt: dataFimConsulta
          }
        },
        include: {
          paciente: true,
          medico: true
        },
        orderBy: { dataHora: 'asc' }
      })

      const horariosOcupados = consultasDoDia.map(c => ({
        hora: new Date(c.dataHora).getHours(),
        paciente: c.paciente?.nome,
        medico: c.medico?.nome,
        status: c.status
      }))

      return NextResponse.json({
        data,
        totalConsultas: consultasDoDia.length,
        horariosOcupados,
        consultas: consultasDoDia
      })
    }

    return NextResponse.json({ error: 'Tipo de relatório inválido' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    )
  }
}