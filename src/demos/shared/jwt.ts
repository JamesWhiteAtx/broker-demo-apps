
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

  expires: Date;
  issued: Date;
}

export class Jwt {
  encoded: string;
  header: JwtHeader;
  payload: JwtPayload;
  errors: string[];
  private _valid: boolean = false;

  constructor(encoded: string) {
    var parts: string[];
    this.errors = [];
   
    this.encoded = encoded;
    parts = this.encoded.split('.');
    if (parts.length !== 3) {
      this.addErr('JWT must have 3 parts');
    }

    this.header = <JwtHeader>JSON.parse(atob(parts[0]));
    this.payload = <JwtPayload>JSON.parse(atob(parts[1]));

    if (typeof this.payload.exp === 'undefined') {
      this.payload.expires = null;
    } else if (typeof this.payload.exp === 'number') {
      var expDate = new Date(0);
      expDate.setUTCSeconds(this.payload.exp);
      this.payload.expires = expDate;
    } else {
      this.addErr('JWT has invalid expiration date');
    }

    if (typeof this.payload.iat === 'undefined') {
      this.payload.expires = null;
    } else if (typeof this.payload.iat === 'number') {
      var expDate = new Date(0);
      expDate.setUTCSeconds(this.payload.iat);
      this.payload.issued = expDate;
    }

    this._valid = true;
  }

  get valid(): boolean {
    if (this._valid) {
      if (this.expired()) {
        this.addErr('token has expired');
      }
      this._valid =  (this.errors.length === 0);
    }
    return this._valid;
  }

  expired(): boolean {
    if (this.payload.expires === null) {
      return false;
    }
    return Date.now() > this.payload.expires.valueOf();
  }

  private addErr(description: string) {
    this.errors.push(description);
  }

}