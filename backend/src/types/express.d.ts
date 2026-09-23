/**
 * Declaration merging to extend Express's Request interface.
 * This eliminates all (req as any).user casts throughout the codebase.
 */
declare namespace Express {
  interface Request {
    user: {
      userId: string;
    };
  }
}
