export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
}

export interface UserResponse {
  _id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}
