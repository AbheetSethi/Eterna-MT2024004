import { TokenData, PaginatedResponse } from '../types';

export function encodeCursor(index: number): string {
  const data = `${index}:${Date.now()}`;
  return Buffer.from(data).toString('base64');
}

export function decodeCursor(cursor: string): number {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [index] = decoded.split(':');
    return parseInt(index, 10);
  } catch (error) {
    return 0;
  }
}

export function paginate(
  tokens: TokenData[],
  limit: number = 30,
  cursor?: string
): PaginatedResponse {
  const startIndex = cursor ? decodeCursor(cursor) : 0;
  const endIndex = startIndex + limit;
  
  const page = tokens.slice(startIndex, endIndex);
  const nextCursor = endIndex < tokens.length ? encodeCursor(endIndex) : null;

  return {
    tokens: page,
    nextCursor,
  };
}
