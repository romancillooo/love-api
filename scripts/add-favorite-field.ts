// scripts/add-favorite-field.ts
import 'tsconfig-paths/register';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { Photo } from '../src/models/appModels/Photo';
import { logger } from '../src/shared/utils/logger';

/**
 * Script de migración para agregar el campo isFavorite a todas las fotos existentes
 */
async function migrateFavoriteField() {
  try {
    await connectDatabase();
    logger.info('🔄 Iniciando migración del campo isFavorite...');

    // Actualizar todas las fotos que no tienen el campo isFavorite
    const result = await Photo.updateMany(
      { isFavorite: { $exists: false } },
      { $set: { isFavorite: false } }
    );

    logger.info(`✅ Migración completada: ${result.modifiedCount} fotos actualizadas`);
    
    // Mostrar resumen
    const total = await Photo.countDocuments({});
    const favorites = await Photo.countDocuments({ isFavorite: true });
    logger.info(`📊 Total de fotos: ${total}, Favoritas: ${favorites}`);

  } catch (error) {
    logger.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}

migrateFavoriteField()
  .then(() => {
    logger.info('🎉 Migración finalizada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('💥 Error fatal:', error);
    process.exit(1);
  });


