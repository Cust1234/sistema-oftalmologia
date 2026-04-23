'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface RelatorioData {
  totalPacientes: number
  totalMedicos: number
  consultasHoje: number
  consultasAgendadas: number
  consultasRealizadas: number
  consultasCanceladas: number
  consultasHojeLista: any[]
  consultasPorStatus?: any[]
  consultasPorMes?: any[]
  consultasPorMedico?: any[]
  pacientesPorSexo?: any[]
  medicosPorEspecialidade?: any[]
  totalReceitas?: number
  pagamentosPorForma?: any[]
}

export default function RelatoriosPage() {
  const [data, setData] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('dashboard')
  const [periodo, setPeriodo] = useState({ inicio: '', fim: '' })
  const [exportando, setExportando] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const perfil = localStorage.getItem('perfil')
    if (perfil !== 'ADMIN') {
      router.push('/login')
      return
    }
    carregarDados()
  }, [router, periodo, abaAtiva])

  const carregarDados = async () => {
    setLoading(true)
    try {
      let url = `/api/relatorios?tipo=${abaAtiva}`
      if (periodo.inicio && periodo.fim) {
        url += `&dataInicio=${periodo.inicio}&dataFim=${periodo.fim}`
      }
      const res = await fetch(url)
      const resultado = await res.json()
      setData(resultado)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportar = async (tipo: string) => {
    setExportando(true)
    try {
      const params = new URLSearchParams()
      params.append('tipo', tipo)
      params.append('formato', 'csv')
      if (periodo.inicio) params.append('dataInicio', periodo.inicio)
      if (periodo.fim) params.append('dataFim', periodo.fim)
      
      const response = await fetch(`/api/relatorios/exportar?${params.toString()}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar relatório')
    } finally {
      setExportando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 text-white">
          <div className="p-6"><h2 className="text-xl font-bold">Clínica MMQ</h2></div>
        </div>
        <div className="ml-64 p-8">
          <div className="text-center">Carregando relatórios...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold">Clínica MMQ</h2>
          <p className="text-gray-400 text-sm">Administrador</p>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard/admin" className="block py-3 px-6 hover:bg-gray-800">📊 Dashboard</Link>
          <Link href="/dashboard/admin/pacientes" className="block py-3 px-6 hover:bg-gray-800">👥 Pacientes</Link>
          <Link href="/dashboard/admin/medicos" className="block py-3 px-6 hover:bg-gray-800">👨‍⚕️ Médicos</Link>
          <Link href="/dashboard/admin/consultas" className="block py-3 px-6 hover:bg-gray-800">📅 Consultas</Link>
          <Link href="/dashboard/admin/relatorios" className="block py-3 px-6 bg-gray-800">📈 Relatórios</Link>
          <Link href="/dashboard/admin/usuarios" className="block py-3 px-6 hover:bg-gray-800">👤 Utilizadores</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Relatórios e Estatísticas</h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportar(abaAtiva)}
              disabled={exportando}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {exportando ? 'A exportar...' : '📥 Exportar CSV'}
            </button>
          </div>
        </div>

        {/* Filtro de Período */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="date"
              value={periodo.inicio}
              onChange={(e) => setPeriodo({ ...periodo, inicio: e.target.value })}
              className="p-2 border rounded-lg"
            />
            <input
              type="date"
              value={periodo.fim}
              onChange={(e) => setPeriodo({ ...periodo, fim: e.target.value })}
              className="p-2 border rounded-lg"
            />
            <button
              onClick={() => setPeriodo({ inicio: '', fim: '' })}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-4">
            {['dashboard', 'consultas', 'pacientes', 'medicos', 'financeiro'].map((aba) => (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                className={`py-2 px-4 font-medium ${
                  abaAtiva === aba
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {aba === 'dashboard' && '📊 Dashboard'}
                {aba === 'consultas' && '📅 Consultas'}
                {aba === 'pacientes' && '👥 Pacientes'}
                {aba === 'medicos' && '👨‍⚕️ Médicos'}
                {aba === 'financeiro' && '💰 Financeiro'}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'dashboard' && (
          <div>
            {/* Cards Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold">{data?.totalPacientes || 0}</div>
                <div className="text-gray-500">Pacientes</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl mb-2">👨‍⚕️</div>
                <div className="text-2xl font-bold">{data?.totalMedicos || 0}</div>
                <div className="text-gray-500">Médicos</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-2xl font-bold">{data?.consultasHoje || 0}</div>
                <div className="text-gray-500">Consultas Hoje</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-2xl font-bold">{data?.consultasAgendadas || 0}</div>
                <div className="text-gray-500">Agendadas</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold">{data?.totalReceitas?.toLocaleString() || 0} MZN</div>
                <div className="text-gray-500">Receitas</div>
              </div>
            </div>

            {/* Consultas do Dia */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Consultas de Hoje</h2>
              {data?.consultasHojeLista?.length === 0 ? (
                <p className="text-gray-500">Nenhuma consulta agendada para hoje</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Hora</th>
                      <th className="p-3 text-left">Paciente</th>
                      <th className="p-3 text-left">Médico</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.consultasHojeLista?.map((consulta) => (
                      <tr key={consulta.id} className="border-t">
                        <td className="p-3">{new Date(consulta.dataHora).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-3">{consulta.paciente?.nome}</td>
                        <td className="p-3">{consulta.medico?.nome}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            consulta.status === 'AGENDADA' ? 'bg-yellow-100 text-yellow-800' :
                            consulta.status === 'REALIZADA' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {consulta.status === 'AGENDADA' ? 'Agendada' : consulta.status === 'REALIZADA' ? 'Realizada' : 'Cancelada'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'consultas' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Consultas por Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {data?.consultasPorStatus?.map((item: any) => (
                <div key={item.status} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{item._count}</div>
                  <div className="text-gray-600">
                    {item.status === 'AGENDADA' ? 'Agendadas' : item.status === 'REALIZADA' ? 'Realizadas' : 'Canceladas'}
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-semibold mb-4 mt-6">Consultas por Médico</h2>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Médico</th>
                  <th className="p-3 text-left">Especialidade</th>
                  <th className="p-3 text-left">Total Consultas</th>
                </tr>
              </thead>
              <tbody>
                {data?.consultasPorMedico?.map((item: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.medico}</td>
                    <td className="p-3">{item.especialidade}</td>
                    <td className="p-3">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {abaAtiva === 'pacientes' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Pacientes por Sexo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {data?.pacientesPorSexo?.map((item: any) => (
                <div key={item.sexo} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{item._count}</div>
                  <div className="text-gray-600">{item.sexo === 'MASCULINO' ? 'Masculino' : item.sexo === 'FEMININO' ? 'Feminino' : 'Não informado'}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Resumo</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between py-2">
                  <span>Total de Pacientes:</span>
                  <span className="font-bold">{data?.totalPacientes || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'medicos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Médicos por Especialidade</h2>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Especialidade</th>
                  <th className="p-3 text-left">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {data?.medicosPorEspecialidade?.map((item: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.especialidade}</td>
                    <td className="p-3">{item._count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {abaAtiva === 'financeiro' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Resumo Financeiro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-green-600">{data?.totalReceitas?.toLocaleString() || 0} MZN</div>
                <div className="text-gray-600">Receita Total</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">⏳</div>
                <div className="text-2xl font-bold text-yellow-600">{data?.pagamentosPendentes || 0}</div>
                <div className="text-gray-600">Pagamentos Pendentes</div>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-4 mt-6">Pagamentos por Forma</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data?.pagamentosPorForma?.map((item: any) => (
                <div key={item.formaPagamento} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="font-semibold">
                    {item.formaPagamento === 'DINHEIRO' ? 'Dinheiro' : 
                     item.formaPagamento === 'MPESA' ? 'M-Pesa' : 
                     item.formaPagamento === 'TRANSFERENCIA' ? 'Transferência' : 'Cartão'}
                  </div>
                  <div className="text-xl font-bold">{item._sum?.valor?.toLocaleString() || 0} MZN</div>
                  <div className="text-sm text-gray-500">{item._count} transacções</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de Exportação Rápida */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => handleExportar('consultas')}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            📥 Exportar Consultas
          </button>
          <button
            onClick={() => handleExportar('pacientes')}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            📥 Exportar Pacientes
          </button>
          <button
            onClick={() => handleExportar('medicos')}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            📥 Exportar Médicos
          </button>
          <button
            onClick={() => handleExportar('financeiro')}
            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
          >
            📥 Exportar Financeiro
          </button>
        </div>
      </div>
    </div>
  )
}