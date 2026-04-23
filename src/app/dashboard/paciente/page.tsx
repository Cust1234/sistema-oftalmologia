'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Paciente {
  id: number
  nome: string
  telefone: string
  email: string
  dataNascimento: string
  consultas: any[]
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const perfil = localStorage.getItem('perfil')
    if (perfil !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchPacientes()
  }, [router])

  const fetchPacientes = async () => {
    try {
      const res = await fetch('/api/pacientes')
      const data = await res.json()
      setPacientes(data.pacientes || [])
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!search) {
      fetchPacientes()
      return
    }
    try {
      const res = await fetch(`/api/pacientes?nome=${search}`)
      const data = await res.json()
      setPacientes(data.pacientes || [])
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja eliminar este paciente?')) return

    try {
      await fetch(`/api/pacientes/${id}`, { method: 'DELETE' })
      fetchPacientes()
    } catch (error) {
      console.error('Erro ao eliminar paciente:', error)
    }
  }

  if (loading) {
    return (
      <div className="ml-64 p-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar (igual ao dashboard) */}
      <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold">Clínica MMQ</h2>
          <p className="text-gray-400 text-sm">Administrador</p>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard/admin" className="block py-3 px-6 hover:bg-gray-800">
            📊 Dashboard
          </Link>
          <Link href="/dashboard/admin/pacientes" className="block py-3 px-6 bg-gray-800">
            👥 Pacientes
          </Link>
          <Link href="/dashboard/admin/medicos" className="block py-3 px-6 hover:bg-gray-800">
            👨‍⚕️ Médicos
          </Link>
          <Link href="/dashboard/admin/consultas" className="block py-3 px-6 hover:bg-gray-800">
            📅 Consultas
          </Link>
          <Link href="/dashboard/admin/relatorios" className="block py-3 px-6 hover:bg-gray-800">
            📈 Relatórios
          </Link>
          <Link href="/dashboard/admin/usuarios" className="block py-3 px-6 hover:bg-gray-800">
            👤 Utilizadores
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <Link
            href="/dashboard/admin/pacientes/novo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Novo Paciente
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="flex-1 p-2 border rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Telefone</th>
                <th className="p-3 text-left">E-mail</th>
                <th className="p-3 text-left">Consultas</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr key={paciente.id} className="border-t">
                  <td className="p-3">{paciente.nome}</td>
                  <td className="p-3">{paciente.telefone}</td>
                  <td className="p-3">{paciente.email || '-'}</td>
                  <td className="p-3">{paciente.consultas?.length || 0}</td>
                  <td className="p-3">
                    <Link
                      href={`/dashboard/admin/pacientes/${paciente.id}`}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/dashboard/admin/pacientes/${paciente.id}/editar`}
                      className="text-green-600 hover:underline mr-3"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(paciente.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
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