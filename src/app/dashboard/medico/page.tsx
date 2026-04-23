'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Consulta {
  id: number
  medico: { nome: string; especialidade: string }
  dataHora: string
  status: string
  diagnostico: string
  prescricao: string
}

export default function PacienteDashboard() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const perfil = localStorage.getItem('perfil')
    if (perfil !== 'PACIENTE') {
      router.push('/login')
      return
    }
    fetchConsultas()
  }, [router])

  const fetchConsultas = async () => {
    try {
      const res = await fetch('/api/consultas')
      const data = await res.json()
      setConsultas(data.consultas || [])
    } catch (error) {
      console.error('Erro ao carregar consultas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta consulta?')) return
    try {
      await fetch(`/api/consultas/${id}/cancelar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: 'Cancelado pelo paciente' })
      })
      fetchConsultas()
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-bold">Clínica MMQ - Paciente</h1>
          <button
            onClick={() => {
              localStorage.removeItem('perfil')
              router.push('/login')
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Minhas Consultas</h1>
          <Link
            href="/dashboard/paciente/consultas/nova"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nova Consulta
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Data/Hora</th>
                <th className="p-3 text-left">Médico</th>
                <th className="p-3 text-left">Especialidade</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {consultas.map((consulta) => (
                <tr key={consulta.id} className="border-t">
                  <td className="p-3">{new Date(consulta.dataHora).toLocaleString()}</td>
                  <td className="p-3">{consulta.medico?.nome}</td>
                  <td className="p-3">{consulta.medico?.especialidade}</td>
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
                    {consulta.status === 'AGENDADA' ? (
                      <button onClick={() => handleCancelar(consulta.id)} className="text-red-600 hover:underline">
                        Cancelar
                      </button>
                    ) : consulta.status === 'REALIZADA' ? (
                      <Link href={`/dashboard/paciente/consultas/${consulta.id}`} className="text-blue-600 hover:underline">
                        Ver Receita
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}