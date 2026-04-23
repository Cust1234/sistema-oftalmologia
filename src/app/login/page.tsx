'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('perfil', data.utilizador.perfil)
        
        switch (data.utilizador.perfil) {
          case 'ADMIN':
            router.push('/dashboard/admin')
            break
          case 'MEDICO':
            router.push('/dashboard/medico')
            break
          case 'PACIENTE':
            router.push('/dashboard/paciente')
            break
          default:
            router.push('/dashboard/recepcao')
        }
      } else {
        setErro(data.error || 'Erro ao fazer login')
      }
    } catch {
      setErro('Erro de conexão com o servidor')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Clínica MMQ
          </h1>
          <p className="text-gray-600">Sistema de Gestão de Saúde Oftalmológica</p>
        </div>

        {erro && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@mmq.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {carregando ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/recuperar-senha" className="text-blue-600 text-sm hover:underline">
            Esqueceu a senha?
          </a>
        </div>
      </div>
    </div>
  )
}