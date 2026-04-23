'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NovoMedicoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    especialidade: '',
    numeroOrdem: '',
    telefone: '',
    email: '',
    horarioTrabalho: '',
    diasAtendimento: '',
    duracaoConsulta: '30'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      const res = await fetch('/api/medicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/dashboard/admin/medicos')
      } else {
        const data = await res.json()
        setErro(data.error || 'Erro ao criar médico')
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
          <Link href="/dashboard/admin/medicos" className="block py-3 px-6 bg-gray-800">👨‍⚕️ Médicos</Link>
          <Link href="/dashboard/admin/consultas" className="block py-3 px-6 hover:bg-gray-800">📅 Consultas</Link>
          <Link href="/dashboard/admin/relatorios" className="block py-3 px-6 hover:bg-gray-800">📈 Relatórios</Link>
          <Link href="/dashboard/admin/usuarios" className="block py-3 px-6 hover:bg-gray-800">👤 Utilizadores</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Novo Médico</h1>
          <Link href="/dashboard/admin/medicos" className="text-gray-600 hover:text-gray-800">
            ← Voltar
          </Link>
        </div>

        {erro && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{erro}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Nome Completo *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Especialidade *</label>
              <input
                type="text"
                name="especialidade"
                value={formData.especialidade}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
                placeholder="Ex: Oftalmologia, Cardiologia..."
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Nº Ordem Profissional</label>
              <input
                type="text"
                name="numeroOrdem"
                value={formData.numeroOrdem}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Telefone *</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Duração da Consulta (minutos)</label>
              <select
                name="duracaoConsulta"
                value={formData.duracaoConsulta}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Dias de Atendimento</label>
              <select
                name="diasAtendimento"
                value={formData.diasAtendimento}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Seleccionar</option>
                <option value="SEG,TER,QUA,QUI,SEX">Segunda a Sexta</option>
                <option value="SEG,TER,QUA,QUI,SEX,SAB">Segunda a Sábado</option>
                <option value="SEG,TER,QUA,QUI">Segunda a Quinta</option>
                <option value="SEG,TER,SEX">Segunda, Terça e Sexta</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Horário de Trabalho</label>
              <input
                type="text"
                name="horarioTrabalho"
                value={formData.horarioTrabalho}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Ex: 08:00 - 17:00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Link href="/dashboard/admin/medicos" className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'A guardar...' : 'Guardar Médico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}