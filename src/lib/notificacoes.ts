import { prisma } from './prisma'

interface ConsultaNotificacao {
  id: number
  paciente: { nome: string; telefone?: string; email?: string }
  medico: { nome: string }
  dataHora: Date
}

export async function enviarNotificacaoConsulta(consulta: ConsultaNotificacao) {
  const dataFormatada = new Date(consulta.dataHora).toLocaleString('pt-PT')
  const mensagem = `Olá ${consulta.paciente.nome}, sua consulta com Dr(a). ${consulta.medico.nome} está agendada para ${dataFormatada}.`

  // Guardar notificação na base de dados
  await prisma.notificacaoPaciente.create({
    data: {
      idPaciente: consulta.id,
      titulo: 'Consulta Agendada',
      mensagem,
      tipo: 'EMAIL'
    }
  })

  // Enviar e-mail se tiver email
  if (consulta.paciente.email) {
    await enviarEmail(consulta.paciente.email, 'Consulta Agendada', mensagem)
  }

  // Enviar SMS se tiver telefone
  if (consulta.paciente.telefone) {
    await enviarSMS(consulta.paciente.telefone, mensagem)
  }
}

export async function enviarLembreteConsultas() {
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  const amanhaFim = new Date(amanha)
  amanhaFim.setHours(23, 59, 59)

  const consultas = await prisma.consulta.findMany({
    where: {
      dataHora: {
        gte: amanha,
        lte: amanhaFim
      },
      status: 'AGENDADA'
    },
    include: {
      paciente: true,
      medico: true
    }
  })

  for (const consulta of consultas) {
    const dataFormatada = new Date(consulta.dataHora).toLocaleString('pt-PT')
    const mensagem = `Lembrete: Você tem consulta amanhã às ${dataFormatada} com Dr(a). ${consulta.medico.nome}.`

    await prisma.notificacaoPaciente.create({
      data: {
        idPaciente: consulta.idPaciente,
        titulo: 'Lembrete de Consulta',
        mensagem,
        tipo: 'EMAIL'
      }
    })

    if (consulta.paciente.email) {
      await enviarEmail(consulta.paciente.email, 'Lembrete de Consulta', mensagem)
    }
  }
}

async function enviarEmail(to: string, subject: string, text: string) {
  // Implementar com nodemailer
  console.log(`Enviando e-mail para ${to}: ${subject}`)
}

async function enviarSMS(to: string, message: string) {
  // Implementar com Twilio ou API de SMS local
  console.log(`Enviando SMS para ${to}: ${message}`)
}