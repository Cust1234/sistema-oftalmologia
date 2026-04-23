import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verificarToken, obterTokenDaRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, senha, perfil, telefone } = body

    // Validar campos obrigatórios
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se e-mail já existe
    const utilizadorExistente = await prisma.utilizador.findUnique({
      where: { email }
    })

    if (utilizadorExistente) {
      return NextResponse.json(
        { error: 'E-mail já registado' },
        { status: 409 }
      )
    }

    // Verificar se o utilizador que está a criar é ADMIN (para criar outros perfis)
    let perfilPermitido = perfil || 'PACIENTE'
    
    const token = obterTokenDaRequest(request)
    if (token) {
      const payload = verificarToken(token)
      if (payload?.perfil === 'ADMIN') {
        // ADMIN pode criar qualquer perfil
        perfilPermitido = perfil
      }
    }

    // Validar perfil
    const perfisValidos = ['ADMIN', 'MEDICO', 'RECEPCAO', 'PACIENTE']
    if (!perfisValidos.includes(perfilPermitido)) {
      return NextResponse.json(
        { error: 'Perfil inválido' },
        { status: 400 }
      )
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10)

    // Criar utilizador
    const utilizador = await prisma.utilizador.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        perfil: perfilPermitido as any
      }
    })

    // Se for médico, criar registo na tabela medico
    if (perfilPermitido === 'MEDICO') {
      await prisma.medico.create({
        data: {
          nome,
          email,
          telefone: telefone || '',
          especialidade: 'Geral',
          numeroOrdem: 'PENDENTE',
          idUtilizador: utilizador.id
        }
      })
    }

    // Se for paciente, criar registo na tabela paciente
    if (perfilPermitido === 'PACIENTE') {
      await prisma.paciente.create({
        data: {
          nome,
          email: email,
          telefone: telefone || '',
          idUtilizador: utilizador.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Utilizador registado com sucesso',
      utilizador: {
        id: utilizador.id,
        nome: utilizador.nome,
        email: utilizador.email,
        perfil: utilizador.perfil
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro no registo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}