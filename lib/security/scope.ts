export function tenantScopedWhere<T extends Record<string, unknown>>(tenantId: string, where: T = {} as T) {
  return { tenantId, ...where };
}
