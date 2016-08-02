
export interface JwtHeader {
  alg?: string;
  kid?: string;
}
export interface JwtPayload {
  acr?: string;
  aud?: string;
  auth_time?: number;
  client_id?: string;
  exp?: number;
  iat?: number;
  jti?: string;
  iss?: string;
  nonce?: string;
  scope?: string;
  sub?: string;
}

export class Jwt {
  header: JwtHeader;
  payload: JwtPayload;
  constructor(raw: string) {
    var parts = raw.split('.');
    this.header = <JwtHeader>JSON.parse(atob(parts[0]));
    this.payload = <JwtPayload>JSON.parse(atob(parts[1]));    
  }
}