'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DashboardData {
  totalPacientes: number
  totalMedicos: number
  consultasHoje: number
  consultasAgendadas: number
  consultasRealizadas: number
  consultasCanceladas: number
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const perfil = localStorage.getItem('perfil')
    if (perfil !== 'ADMIN') {
      router.push('/login')
      return
    }
    fetchDashboard()
  }, [router])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/relatorios')
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('perfil')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Carregando...</div>
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
          <Link href="/dashboard/admin" className="block py-3 px-6 bg-gray-800">
            📊 Dashboard
          </Link>
          <Link href="/dashboard/admin/pacientes" className="block py-3 px-6 hover:bg-gray-800">
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
        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 bg-red-600 py-2 rounded-lg hover:bg-red-700"
        >
          Sair
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-blue-600 text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold">{data?.totalPacientes || 0}</div>
            <div className="text-gray-500">Pacientes</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-green-600 text-3xl mb-2">👨‍⚕️</div>
            <div className="text-2xl font-bold">{data?.totalMedicos || 0}</div>
            <div className="text-gray-500">Médicos</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-yellow-600 text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold">{data?.consultasHoje || 0}</div>
            <div className="text-gray-500">Consultas Hoje</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-purple-600 text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold">{data?.consultasAgendadas || 0}</div>
            <div className="text-gray-500">Agendadas</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-green-500 text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold">{data?.consultasRealizadas || 0}</div>
            <div className="text-gray-500">Realizadas</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-red-500 text-3xl mb-2">❌</div>
            <div className="text-2xl font-bold">{data?.consultasCanceladas || 0}</div>
            <div className="text-gray-500">Canceladas</div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
          <div className="flex gap-4">
            <Link href="/dashboard/admin/pacientes/novo" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + Novo Paciente
            </Link>
            <Link href="/dashboard/admin/consultas/nova" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              + Nova Consulta
            </Link>
            <Link href="/dashboard/admin/relatorios" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              📊 Ver Relatórios
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}