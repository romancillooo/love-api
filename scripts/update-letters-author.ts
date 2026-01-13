// scripts/update-letters-author.ts
import 'tsconfig-paths/register';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { Letter } from '../src/models/appModels/Letter';
import { User } from '../src/models/coreModels/User';
import { logger } from '../src/shared/utils/logger';

async function migrateLettersAuthor() {
  try {
    await connectDatabase();
    logger.info('🔄 Iniciando actualización de autoría de cartas manual...');

    // 1. Encontrar al usuario 'romancillooo'
    const username = 'romancillooo';
    const author = await User.findOne({ username });

    if (!author) {
      throw new Error(`Usuario '${username}' no encontrado. No se puede realizar la migración.`);
    }

    logger.info(`✅ Usuario encontrado: ${author.username} (${author._id})`);

    // 2. Actualizar todas las cartas que no tiene 'createdBy' o forzar todas si así se desea
    // El usuario pidió: "Por el momento el usuario 'romancillooo' fue el que creo todas las cartas"
    // Así que actualizaremos TODAS las que no tengan autor, o incluso todas para asegurar.
    // Vamos a actualizar las que no tienen creador para ser seguros, o todas.
    // Dado el requerimiento, actualizaremos las que les falta el campo.
    
    // Primero contamos cuantas faltan
    const pendingCount = await Letter.countDocuments({ createdBy: { $exists: false } });
    logger.info(`📝 Cartas sin autor detectadas: ${pendingCount}`);

    if (pendingCount > 0) {
      const result = await Letter.updateMany(
        { createdBy: { $exists: false } },
        { $set: { createdBy: author._id } }
      );
      logger.info(`✅ Se actualizaron ${result.modifiedCount} cartas con el autor ${username}.`);
    } else {
        logger.info('👍 No hay cartas pendientes de asignar autor.');
    }

    // Verificación
    const total = await Letter.countDocuments({});
    const withAuthor = await Letter.countDocuments({ createdBy: author._id });
    logger.info(`📊 Estado final - Total cartas: ${total}, Creadas por ${username}: ${withAuthor}`);

  } catch (error) {
    logger.error('❌ Error en el script:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

migrateLettersAuthor().then(() => {
    logger.info('🏁 Script finalizado.');
    process.exit(0);
});
