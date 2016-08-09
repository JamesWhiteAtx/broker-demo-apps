import { Component, OnInit, Input } from '@angular/core';
import { Jwt } from './jwt'

interface NameValue {name: string, value?: string}

@Component({
  selector: 'demo-jwt',
  templateUrl: 'app/jwt.component.html'
})
export class JwtComponent implements OnInit {
  @Input()
  decoded: boolean;

  @Input() 
  jwt: Jwt;

  claims: NameValue[];

  ngOnInit() {
    this.claims = [];
    this.addClaim(this.format(this.jwt.payload.issued), 'Issued');
    this.addClaim(this.format(this.jwt.payload.expires), 'Expires');
    this.addClaim(this.jwt.payload.sub, 'Subject');
	  this.addClaim(this.jwt.payload.scope, 'Scope');
    this.addClaim(this.jwt.payload.client_id, 'Client ID');
    this.addClaim(this.jwt.payload.acr, 'ACR');
    this.addClaim(this.jwt.payload.aud, 'Audience');
    this.addClaim(this.jwt.payload.iss, 'Issuer');
    this.addClaim(this.jwt.payload.nonce, 'Nonce');
  }

  private format(dt: Date): string {
    if (!dt) {return null;}
    return dt.toLocaleString();
  }

  private addClaim(value, name) {
    if (value) {
      this.claims.push({name: name, value: value});
    }
  }

  toggle() {
    this.decoded = ! this.decoded;
    return false;
  }
}