'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditarPacientePage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    sexo: '',
    telefone: '',
    telefoneAlternativo: '',
    endereco: '',
    email: '',
    alergias: '',
    doencasCronicas: '',
    medicamentosUso: ''
  })

  useEffect(() => {
    carregarPaciente()
  }, [id])

  const carregarPaciente = async () => {
    try {
      const res = await fetch(`/api/pacientes/${id}`)
      if (!res.ok) throw new Error('Erro ao carregar paciente')
      const data = await res.json()
      setFormData({
        nome: data.nome || '',
        dataNascimento: data.dataNascimento ? data.dataNascimento.split('T')[0] : '',
        sexo: data.sexo || '',
        telefone: data.telefone || '',
        telefoneAlternativo: data.telefoneAlternativo || '',
        endereco: data.endereco || '',
        email: data.email || '',
        alergias: data.alergias || '',
        doencasCronicas: data.doencasCronicas || '',
        medicamentosUso: data.medicamentosUso || ''
      })
    } catch (error) {
      console.error('Erro ao carregar paciente:', error)
      setErro('Erro ao carregar dados do paciente')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setErro('')

    try {
      const res = await fetch(`/api/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push(`/dashboard/admin/pacientes/${id}`)
      } else {
        const data = await res.json()
        setErro(data.error || 'Erro ao actualizar paciente')
      }
    } catch {
      setErro('Erro de conexão com o servidor')
    } finally {
      setSalvando(false)
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
          <h1 className="text-2xl font-bold">Editar Paciente</h1>
          <Link href={`/dashboard/admin/pacientes/${id}`} className="text-gray-600 hover:text-gray-800">
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
              <label className="block text-gray-700 mb-2">Data de Nascimento</label>
              <input
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Sexo</label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Seleccionar</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
              </select>
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
              <label className="block text-gray-700 mb-2">Telefone Alternativo</label>
              <input
                type="tel"
                name="telefoneAlternativo"
                value={formData.telefoneAlternativo}
                onChange={handleChange}
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

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Endereço</label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Alergias</label>
              <textarea
                name="alergias"
                value={formData.alergias}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Doenças Crónicas</label>
              <textarea
                name="doencasCronicas"
                value={formData.doencasCronicas}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Medicamentos em Uso</label>
              <textarea
                name="medicamentosUso"
                value={formData.medicamentosUso}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Link href={`/dashboard/admin/pacientes/${id}`} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={salvando}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {salvando ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}