import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

interface BodyParserError extends Error {
  type?: string;
}

export function errorHandler(
  error: BodyParserError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'JSON inválido no corpo da requisição' });
    return;
  }

  console.error('Erro interno não tratado:', error);
  res.status(500).json({ message: 'Erro interno do servidor' });
}
