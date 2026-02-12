export interface Root {
  data: Daum[]
  meta: Meta
}

export interface Daum {
  id: number
  documentId: string
  name: string
  categories: any[]
}

export interface Meta {
  pagination: Pagination
}

export interface Pagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}
