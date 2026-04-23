const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.utilizador.upsert({
    where: { email: 'admin@mmq.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@mmq.com',
      senha: senhaHash,
      perfil: 'ADMIN'
    }
  })
  
  console.log('Administrador criado:', admin)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())