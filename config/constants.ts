export const SEED = 20260816

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'] as const

export const UPLOAD_DIR = 'storage/uploads'
export const REPORTS_DIR = 'storage/reports'

export const ALLOWED_UPLOAD_EXTENSIONS = ['.txt', '.png', '.jpg', '.jpeg', '.pdf'] as const

export const DEFAULT_REDIRECT = '/orders'

export type Role = 'customer' | 'admin'

