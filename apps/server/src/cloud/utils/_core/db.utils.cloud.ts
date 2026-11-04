import Config from 'parse-server/lib/Config.js';

import { logger } from '@/utils/_core/logger';

/**
 * connect to db directly
 * @param {*} className
 * @returns
 */
export const getMongoCollection = async (className: string): Promise<any> => {
  const config = Config.get(Parse.applicationId);
  const db = config.database;
  const mongoAdapter = db.adapter;

  await mongoAdapter.connect();
  return mongoAdapter.database.collection(className);
};

export const getDatabaseController = () => {
  const config = Config.get(Parse.applicationId);

  return config.database;
};

/**
 * Get mongodb session - used for transaction
 *
 * @returns {Promise<*>}
 */
export const getMongoSession = async () => {
  const mongoAdapter = getDatabaseController().adapter;

  await mongoAdapter.connect();

  return mongoAdapter.client.startSession();
};


/**
 * to execute directly aggregate pipeline
 * @param {string} className
 * @param {Array} pipeline
 * @param {boolean} [withWeakCollation] (only used if necessary)
 */
export const aggregate = async (
  className: string,
  pipeline: any[],
  withWeakCollation = false
): Promise<any> => {
  // ---- configuration ----//
  const collection = await getMongoCollection(className);

  // ---- collation setting ----//
  const options: Record<string, any> = {};

  if (withWeakCollation) {
    options.collation = { locale: 'fr', strength: 1 };
  }
  // ---- aggregate execution ----//
  const query = await collection.aggregate(pipeline, options).toArray();

  return query;
};


/**
 * Executes a MongoDB transaction with the provided callback.
 * @NOTE Transaction is only supported for replica sets.
 * So it's not supported for local or free tier MongoDB Atlas clusters.
 * @param {Function} callback - The callback function to execute within the transaction.
 */
export const withTransaction = async <O extends Record<string, any>>(
  callback: (session: any) => Promise<O>,
  shouldHandleError = false
) => {
  logger.debug('Executing transaction...');

  if (typeof callback !== 'function' || !callback) {
    logger.error(`withTransaction expects fn parameter as function but got ${typeof callback}`);
    throw new Error('You must provide a function as a parameter of withTransaction');
  }
  const transactionOptions = {
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
  };

  let session: Record<string, any> = {};
  let result;

  try {
    session = await getMongoSession();
    result = await session.withTransaction(async () => {
      await callback(session);
    }, transactionOptions);
    logger.debug('Transaction successful!', { result });

    return result;
  }
  // Abort the transaction if an error occurs
  catch (error) {
    // Log the exception if handleException = true
    if (shouldHandleError) {
      logger.error('Transaction Error', {
        error: (error as Error).message,
        errorStack: (error as Error).stack,
      });
    }
    else {
      // Re-throw the exception and the  caller is responsible for catching it
      throw error;
    }
  }
  // End the session
  finally {
    session.endSession();
  }
};

/*
 * Example usage
 * withTransaction(async (session) => {
 *   const productCollection = mongoAdapter.client.db().collection('_Product');
 *   const orderCollection = mongoAdapter.client.db().collection('_Order');
 */

/*
 *   // Fetch the product
 *   const product = await productCollection.findOne({ objectId: productId }, { session });
 */

/*
 *   if (!product || product.stock < quantity) {
 *     throw new Error('Insufficient stock');
 *   }
 */

/*
 *   // Update product stock
 *   await productCollection.updateOne(
 *     { objectId: productId },
 *     { $inc: { stock: -quantity } },
 *     { session }
 *   );
 */

/*
 *   // Create the order
 *   const newOrder = {
 *     productId,
 *     quantity,
 *     createdAt: new Date(),
 *     updatedAt: new Date(),
 *   };
 */

/*
 *   await orderCollection.insertOne(newOrder, { session });
 * });
 */
