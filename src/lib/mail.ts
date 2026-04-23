import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function enviarEmailRecuperacao(to: string, resetLink: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recuperação de Senha</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 10px;">
        <h2 style="color: #1e40af;">Recuperação de Senha</h2>
        <p>Olá,</p>
        <p>Recebemos um pedido para redefinir a sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Redefinir Senha
          </a>
        </div>
        <p>Se não foi você quem solicitou, ignore este e-mail.</p>
        <p>Este link é válido por 1 hora.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">Clínica MMQ - Sistema de Gestão de Saúde Oftalmológica</p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"Clínica MMQ" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Recuperação de Senha - Clínica MMQ',
    html
  })
}

export async function enviarEmailBoasVindas(to: string, nome: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bem-vindo à Clínica MMQ</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 10px;">
        <h2 style="color: #166534;">Bem-vindo, ${nome}!</h2>
        <p>A sua conta foi criada com sucesso no Sistema de Gestão de Saúde Oftalmológica.</p>
        <p>Já pode aceder ao sistema e agendar as suas consultas.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/login" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Aceder ao Sistema
          </a>
        </div>
        <hr style="margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">Clínica MMQ - Sistema de Gestão de Saúde Oftalmológica</p>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"Clínica MMQ" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Bem-vindo à Clínica MMQ',
    html
  })
}