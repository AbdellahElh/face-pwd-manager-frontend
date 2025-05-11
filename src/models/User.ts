export interface User {
  id: number;
  email: string;
  token: string;
  faceImage: string;
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    faceImage: string;
  };
  token: string;
}

export interface LoginRequest {
  email: string;
  selfie?: Blob;
}
