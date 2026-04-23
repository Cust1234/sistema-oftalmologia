'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Paciente {
  id: number
  nome: string
  dataNascimento: string
  sexo: string
  telefone: string
  telefoneAlternativo: string
  endereco: string
  email: string
  alergias: string
  doencasCronicas: string
  medicamentosUso: string
  consultas: any[]
}

export default function DetalhesPacientePage() {
  const { id } = useParams()
  const router = useRouter()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaciente()
  }, [id])

  const fetchPaciente = async () => {
    try {
      const res = await fetch(`/api/pacientes/${id}`)
      const data = await res.json()
      setPaciente(data)
    } catch (error) {
      console.error('Erro ao carregar paciente:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="ml-64 p-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="ml-64 p-8">
        <div className="text-center text-red-600">Paciente não encontrado</div>
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
          <Link href="/dashboard/admin/pacientes" className="block py-3 px-6 bg-gray-800">👥 Pacientes</Link>
          <Link href="/dashboard/admin/medicos" className="block py-3 px-6 hover:bg-gray-800">👨‍⚕️ Médicos</Link>
          <Link href="/dashboard/admin/consultas" className="block py-3 px-6 hover:bg-gray-800">📅 Consultas</Link>
          <Link href="/dashboard/admin/relatorios" className="block py-3 px-6 hover:bg-gray-800">📈 Relatórios</Link>
          <Link href="/dashboard/admin/usuarios" className="block py-3 px-6 hover:bg-gray-800">👤 Utilizadores</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Detalhes do Paciente</h1>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/admin/pacientes/${id}/editar`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Editar
            </Link>
            <Link
              href={`/dashboard/admin/consultas/nova?pacienteId=${id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Nova Consulta
            </Link>
            <Link href="/dashboard/admin/pacientes" className="text-gray-600 hover:text-gray-800">
              ← Voltar
            </Link>
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="font-medium">Nome:</span> {paciente.nome}</div>
            <div><span className="font-medium">Data Nascimento:</span> {paciente.dataNascimento ? new Date(paciente.dataNascimento).toLocaleDateString() : '-'}</div>
            <div><span className="font-medium">Sexo:</span> {paciente.sexo || '-'}</div>
            <div><span className="font-medium">Telefone:</span> {paciente.telefone}</div>
            <div><span className="font-medium">Telefone Alt.:</span> {paciente.telefoneAlternativo || '-'}</div>
            <div><span className="font-medium">E-mail:</span> {paciente.email || '-'}</div>
            <div className="md:col-span-2"><span className="font-medium">Endereço:</span> {paciente.endereco || '-'}</div>
          </div>
        </div>

        {/* Informações Clínicas */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações Clínicas</h2>
          <div className="grid grid-cols-1 gap-4">
            <div><span className="font-medium">Alergias:</span> {paciente.alergias || 'Nenhuma registada'}</div>
            <div><span className="font-medium">Doenças Crónicas:</span> {paciente.doencasCronicas || 'Nenhuma registada'}</div>
            <div><span className="font-medium">Medicamentos em Uso:</span> {paciente.medicamentosUso || 'Nenhum registado'}</div>
          </div>
        </div>

        {/* Histórico de Consultas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Histórico de Consultas</h2>
          {paciente.consultas?.length === 0 ? (
            <p className="text-gray-500">Nenhuma consulta registada</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-left">Médico</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paciente.consultas?.map((consulta) => (
                  <tr key={consulta.id} className="border-t">
                    <td className="p-3">{new Date(consulta.dataHora).toLocaleString()}</td>
                    <td className="p-3">{consulta.medico?.nome}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        consulta.status === 'AGENDADA' ? 'bg-yellow-100 text-yellow-800' :
                        consulta.status === 'REALIZADA' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {consulta.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link href={`/dashboard/admin/consultas/${consulta.id}`} className="text-blue-600 hover:underline">
                        Ver
                      </Link>
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