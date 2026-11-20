import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { prisma } from '../prisma';

/**
 * Custom error class thrown inside a transaction callback to intentionally
 * trigger a PostgreSQL ROLLBACK and return a clean HTTP status code to the client.
 */
export class TransactionError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'TransactionError';
    this.statusCode = statusCode;
  }
}

export interface TransactionOptions {
  isolationLevel?: Prisma.TransactionIsolationLevel;
  maxWait?: number;
  timeout?: number;
}

/**
 * Executes a callback inside an ACID-compliant PostgreSQL transaction via Prisma.
 *
 * Lifecycle:
 *  1. BEGIN     - Prisma acquires a dedicated DB connection and starts a transaction.
 *  2. EXECUTE   - All queries run on the `tx` transaction client.
 *  3. COMMIT    - If the callback resolves, PostgreSQL permanently commits all changes.
 *  4. ROLLBACK  - If ANY error is thrown (TransactionError or DB error), PostgreSQL
 *                 automatically rolls back every write performed inside this block.
 */
export async function runTransaction<T>(
  label: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const start = Date.now();
  const isolationLevel =
    options.isolationLevel ?? Prisma.TransactionIsolationLevel.ReadCommitted;

  console.log(`[TX BEGIN] ${label} (isolation=${isolationLevel})`);

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        return await fn(tx);
      },
      {
        isolationLevel,
        maxWait: options.maxWait ?? 5000,
        timeout: options.timeout ?? 15000,
      }
    );

    const elapsed = Date.now() - start;
    console.log(`[TX COMMIT] ${label} (${elapsed}ms)`);
    return result;
  } catch (error: any) {
    const elapsed = Date.now() - start;
    console.error(
      `[TX ROLLBACK] ${label} (${elapsed}ms) — Reason: ${error?.message || error}`
    );
    throw error;
  }
}

/**
 * Maps TransactionError and common Prisma error codes to clean HTTP JSON responses.
 */
export function handleRouteError(
  res: Response,
  error: any,
  fallbackMessage: string,
  logContext?: string
): void {
  if (error instanceof TransactionError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({
        error: 'A record with this unique value already exists. Transaction rolled back.',
      });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({
        error: 'Target record was not found. Transaction rolled back.',
      });
      return;
    }
  }

  if (logContext) {
    console.error(`${logContext}:`, error);
  } else {
    console.error(fallbackMessage, error);
  }

  res.status(500).json({ error: fallbackMessage });
}
