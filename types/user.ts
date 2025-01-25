export interface User {
  id: string;
  documentId: string;
  email: string;
  fullname: string;
  phone: string;
  yomaId: string;
  token: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    documentId: string;
    email: string | null;
    fullname: string;
    phone: string;
    yoma_id: string | null;
  };
  jwt: string;
}

export function mapLoginResponseToUser(response: LoginResponse): User {
  return {
    id: response.user.id.toString(),
    documentId: response.user.documentId,
    email: response.user.email || '',
    fullname: response.user.fullname,
    phone: response.user.phone,
    yomaId: response.user.yoma_id || '',
    token: response.jwt,
  };
}
