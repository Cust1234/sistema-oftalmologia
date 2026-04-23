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
    const tipo = searchParams.get('tipo') // consultas, pacientes, medicos, financeiro
    const formato = searchParams.get('formato') // csv, json
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    let dados: any[] = []
    let cabecalhos: string[] = []
    let nomeArquivo = `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}`

    // ==================== EXPORTAR CONSULTAS ====================
    if (tipo === 'consultas') {
      let whereConsulta: any = {}

      if (dataInicio && dataFim) {
        whereConsulta.dataHora = {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        }
      }

      const consultas = await prisma.consulta.findMany({
        where: whereConsulta,
        include: {
          paciente: true,
          medico: true,
          prescricoes: true
        },
        orderBy: { dataHora: 'desc' }
      })

      dados = consultas.map(c => ({
        'ID': c.id,
        'Data': new Date(c.dataHora).toLocaleString('pt-PT'),
        'Paciente': c.paciente?.nome || '-',
        'Telefone Paciente': c.paciente?.telefone || '-',
        'Médico': c.medico?.nome || '-',
        'Especialidade': c.medico?.especialidade || '-',
        'Status': c.status === 'AGENDADA' ? 'Agendada' : c.status === 'REALIZADA' ? 'Realizada' : 'Cancelada',
        'Diagnóstico': c.diagnostico || '-',
        'Prescrição': c.prescricao || '-',
        'Observações': c.observacoes || '-'
      }))

      cabecalhos = ['ID', 'Data', 'Paciente', 'Telefone Paciente', 'Médico', 'Especialidade', 'Status', 'Diagnóstico', 'Prescrição', 'Observações']
      nomeArquivo = `consultas_${dataInicio || 'todas'}_${dataFim || 'hoje'}`
    }

    // ==================== EXPORTAR PACIENTES ====================
    else if (tipo === 'pacientes') {
      const pacientes = await prisma.paciente.findMany({
        include: {
          consultas: {
            where: { status: 'REALIZADA' },
            select: { id: true }
          }
        },
        orderBy: { nome: 'asc' }
      })

      dados = pacientes.map(p => ({
        'ID': p.id,
        'Nome': p.nome,
        'Data Nascimento': p.dataNascimento ? new Date(p.dataNascimento).toLocaleDateString('pt-PT') : '-',
        'Sexo': p.sexo === 'MASCULINO' ? 'Masculino' : p.sexo === 'FEMININO' ? 'Feminino' : '-',
        'Telefone': p.telefone,
        'Telefone Alternativo': p.telefoneAlternativo || '-',
        'E-mail': p.email || '-',
        'Endereço': p.endereco || '-',
        'Alergias': p.alergias || '-',
        'Doenças Crónicas': p.doencasCronicas || '-',
        'Total Consultas': p.consultas?.length || 0
      }))

      cabecalhos = ['ID', 'Nome', 'Data Nascimento', 'Sexo', 'Telefone', 'Telefone Alternativo', 'E-mail', 'Endereço', 'Alergias', 'Doenças Crónicas', 'Total Consultas']
      nomeArquivo = `pacientes_${new Date().toISOString().split('T')[0]}`
    }

    // ==================== EXPORTAR MÉDICOS ====================
    else if (tipo === 'medicos') {
      const medicos = await prisma.medico.findMany({
        include: {
          consultas: {
            where: { status: 'REALIZADA' },
            select: { id: true }
          }
        },
        orderBy: { nome: 'asc' }
      })

      dados = medicos.map(m => ({
        'ID': m.id,
        'Nome': m.nome,
        'Especialidade': m.especialidade,
        'Nº Ordem': m.numeroOrdem,
        'Telefone': m.telefone,
        'E-mail': m.email,
        'Horário Trabalho': m.horarioTrabalho || '-',
        'Total Consultas': m.consultas?.length || 0
      }))

      cabecalhos = ['ID', 'Nome', 'Especialidade', 'Nº Ordem', 'Telefone', 'E-mail', 'Horário Trabalho', 'Total Consultas']
      nomeArquivo = `medicos_${new Date().toISOString().split('T')[0]}`
    }

    // ==================== EXPORTAR FINANCEIRO ====================
    else if (tipo === 'financeiro') {
      let wherePagamento: any = {}

      if (dataInicio && dataFim) {
        wherePagamento.dataPagamento = {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        }
      }

      const pagamentos = await prisma.pagamento.findMany({
        where: wherePagamento,
        include: {
          consulta: {
            include: {
              paciente: true,
              medico: true
            }
          }
        },
        orderBy: { dataPagamento: 'desc' }
      })

      dados = pagamentos.map(p => ({
        'ID': p.id,
        'Data Pagamento': p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString('pt-PT') : '-',
        'Consulta ID': p.idConsulta,
        'Paciente': p.consulta?.paciente?.nome || '-',
        'Médico': p.consulta?.medico?.nome || '-',
        'Valor (MZN)': p.valor,
        'Forma Pagamento': p.formaPagamento === 'DINHEIRO' ? 'Dinheiro' : p.formaPagamento === 'MPESA' ? 'M-Pesa' : p.formaPagamento === 'TRANSFERENCIA' ? 'Transferência' : 'Cartão',
        'Status': p.status === 'PAGO' ? 'Pago' : 'Pendente',
        'Referência': p.referencia || '-'
      }))

      cabecalhos = ['ID', 'Data Pagamento', 'Consulta ID', 'Paciente', 'Médico', 'Valor (MZN)', 'Forma Pagamento', 'Status', 'Referência']
      nomeArquivo = `financeiro_${dataInicio || 'todas'}_${dataFim || 'hoje'}`
    }

    else {
      return NextResponse.json({ error: 'Tipo de relatório inválido' }, { status: 400 })
    }

    // ==================== GERAR CSV ====================
    if (formato === 'csv') {
      const csvLinhas = [cabecalhos.join(';')]
      
      for (const row of dados) {
        const linha = cabecalhos.map(cabecalho => {
          let valor = row[cabecalho as keyof typeof row]
          if (valor === undefined || valor === null) valor = ''
          if (typeof valor === 'string' && (valor.includes(';') || valor.includes('"'))) {
            valor = `"${valor.replace(/"/g, '""')}"`
          }
          return valor
        }).join(';')
        csvLinhas.push(linha)
      }

      const csv = csvLinhas.join('\n')
      const bom = '\uFEFF'
      
      return new NextResponse(bom + csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${nomeArquivo}.csv"`
        }
      })
    }

    // ==================== GERAR JSON ====================
    return NextResponse.json({
      cabecalhos,
      dados,
      totalRegistos: dados.length,
      dataExportacao: new Date().toISOString(),
      filtros: { dataInicio, dataFim, tipo }
    })

  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar relatório' },
      { status: 500 }
    )
  }
}