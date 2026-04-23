'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Medico {
  id: number
  nome: string
  especialidade: string
}

interface Paciente {
  id: number
  nome: string
  telefone: string
}

export default function NovaConsultaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pacienteIdParam = searchParams.get('pacienteId')
  
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([])
  const [formData, setFormData] = useState({
    idPaciente: pacienteIdParam || '',
    idMedico: '',
    data: '',
    hora: '',
    observacoes: ''
  })

  useEffect(() => {
    fetchMedicos()
    fetchPacientes()
  }, [])

  useEffect(() => {
    if (formData.idMedico && formData.data) {
      fetchHorariosDisponiveis()
    }
  }, [formData.idMedico, formData.data])

  const fetchMedicos = async () => {
    try {
      const res = await fetch('/api/medicos')
      const data = await res.json()
      setMedicos(data)
    } catch (error) {
      console.error('Erro ao carregar médicos:', error)
    }
  }

  const fetchPacientes = async () => {
    try {
      const res = await fetch('/api/pacientes')
      const data = await res.json()
      setPacientes(data.pacientes || [])
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    }
  }

  const fetchHorariosDisponiveis = async () => {
    try {
      const res = await fetch(`/api/medicos/${formData.idMedico}/disponibilidade?data=${formData.data}`)
      const data = await res.json()
      // Gerar horários disponíveis (exemplo: 08:00, 09:00, 10:00...)
      const horarios = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      const ocupados = data.horariosOcupados.map((h: string) => new Date(h).getHours().toString().padStart(2, '0') + ':00')
      const disponiveis = horarios.filter(h => !ocupados.includes(h))
      setHorariosDisponiveis(disponiveis)
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const dataHora = new Date(`${formData.data}T${formData.hora}`)

    try {
      const res = await fetch('/api/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPaciente: parseInt(formData.idPaciente),
          idMedico: parseInt(formData.idMedico),
          dataHora: dataHora.toISOString(),
          observacoes: formData.observacoes
        })
      })

      if (res.ok) {
        router.push('/dashboard/admin/consultas')
      } else {
        const data = await res.json()
        setErro(data.error || 'Erro ao agendar consulta')
      }
    } catch {
      setErro('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
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
          <Link href="/dashboard/admin/consultas" className="block py-3 px-6 bg-gray-800">📅 Consultas</Link>
          <Link href="/dashboard/admin/relatorios" className="block py-3 px-6 hover:bg-gray-800">📈 Relatórios</Link>
          <Link href="/dashboard/admin/usuarios" className="block py-3 px-6 hover:bg-gray-800">👤 Utilizadores</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Nova Consulta</h1>
          <Link href="/dashboard/admin/consultas" className="text-gray-600 hover:text-gray-800">
            ← Voltar
          </Link>
        </div>

        {erro && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{erro}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Paciente *</label>
              <select
                name="idPaciente"
                value={formData.idPaciente}
                onChange={(e) => setFormData({ ...formData, idPaciente: e.target.value })}
                required
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Seleccionar paciente</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} - {p.telefone}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Médico *</label>
              <select
                name="idMedico"
                value={formData.idMedico}
                onChange={(e) => setFormData({ ...formData, idMedico: e.target.value })}
                required
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Seleccionar médico</option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome} - {m.especialidade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Data *</label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Hora *</label>
              <select
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                required
                disabled={!formData.idMedico || !formData.data}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Seleccionar hora</option>
                {horariosDisponiveis.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Observações</label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Link href="/dashboard/admin/consultas" className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'A agendar...' : 'Agendar Consulta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}