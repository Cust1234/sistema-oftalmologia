'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Medico {
  id: number
  nome: string
  especialidade: string
  numeroOrdem: string
  telefone: string
  email: string
  horarioTrabalho: string
  diasAtendimento: string
  duracaoConsulta: number
  consultas: any[]
}

export default function DetalhesMedicoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [medico, setMedico] = useState<Medico | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarMedico()
  }, [id])

  const carregarMedico = async () => {
    try {
      const res = await fetch(`/api/medicos/${id}`)
      if (!res.ok) throw new Error('Erro ao carregar médico')
      const data = await res.json()
      setMedico(data)
    } catch (error) {
      console.error('Erro ao carregar médico:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja eliminar este médico?')) return
    try {
      await fetch(`/api/medicos/${id}`, { method: 'DELETE' })
      router.push('/dashboard/admin/medicos')
    } catch (error) {
      console.error('Erro ao eliminar médico:', error)
      alert('Erro ao eliminar médico')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 text-white">
          <div className="p-6"><h2 className="text-xl font-bold">Clínica MMQ</h2></div>
        </div>
        <div className="ml-64 p-8"><div className="text-center">Carregando...</div></div>
      </div>
    )
  }

  if (!medico) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 text-white">
          <div className="p-6"><h2 className="text-xl font-bold">Clínica MMQ</h2></div>
        </div>
        <div className="ml-64 p-8">
          <div className="text-center text-red-600">Médico não encontrado</div>
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
          <Link href="/dashboard/admin/medicos" className="block py-3 px-6 bg-gray-800">👨‍⚕️ Médicos</Link>
          <Link href="/dashboard/admin/consultas" className="block py-3 px-6 hover:bg-gray-800">📅 Consultas</Link>
          <Link href="/dashboard/admin/relatorios" className="block py-3 px-6 hover:bg-gray-800">📈 Relatórios</Link>
          <Link href="/dashboard/admin/usuarios" className="block py-3 px-6 hover:bg-gray-800">👤 Utilizadores</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Detalhes do Médico</h1>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/admin/medicos/${id}/editar`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Editar
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Eliminar
            </button>
            <Link href="/dashboard/admin/medicos" className="text-gray-600 hover:text-gray-800">
              ← Voltar
            </Link>
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="font-medium">Nome:</span> {medico.nome}</div>
            <div><span className="font-medium">Especialidade:</span> {medico.especialidade}</div>
            <div><span className="font-medium">Nº Ordem:</span> {medico.numeroOrdem || '-'}</div>
            <div><span className="font-medium">Telefone:</span> {medico.telefone}</div>
            <div><span className="font-medium">E-mail:</span> {medico.email || '-'}</div>
            <div><span className="font-medium">Duração Consulta:</span> {medico.duracaoConsulta} minutos</div>
            <div><span className="font-medium">Dias Atendimento:</span> {medico.diasAtendimento || '-'}</div>
            <div><span className="font-medium">Horário:</span> {medico.horarioTrabalho || '-'}</div>
          </div>
        </div>

        {/* Consultas Realizadas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Consultas Realizadas</h2>
          {medico.consultas?.length === 0 ? (
            <p className="text-gray-500">Nenhuma consulta registada</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-left">Paciente</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {medico.consultas?.map((consulta) => (
                  <tr key={consulta.id} className="border-t">
                    <td className="p-3">{new Date(consulta.dataHora).toLocaleString()}</td>
                    <td className="p-3">{consulta.paciente?.nome}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        consulta.status === 'AGENDADA' ? 'bg-yellow-100 text-yellow-800' :
                        consulta.status === 'REALIZADA' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {consulta.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}