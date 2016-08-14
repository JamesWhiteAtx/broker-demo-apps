export class Configuration {
  public identityProviderUrl: string;
  public resourceServerUrl: string;
  public authorizeRoute: string;
  public logoutRoute: string;
  public clientRedirectUrl: string;
  public responseType: string;
  public clientID: string;
  public scopes: string;
  public acrValues: string;

  //constructor() {  }

  getAuthorizeUrl(state: string) {
    let params: string[] = [
      'response_type=' + encodeURIComponent(this.responseType),
      'client_id=' + encodeURIComponent(this.clientID),
      'redirect_uri=' + encodeURIComponent(this.clientRedirectUrl)
    ];
    if (this.scopes) {
      params.push('scope=' + encodeURIComponent(this.scopes));
    }
    if (this.acrValues) {
      params.push('acr_values=' + encodeURIComponent(this.acrValues));
    }
    if (state) {
      params.push('state=' + encodeURIComponent(state));
      params.push('nonce=' + encodeURIComponent(state));
    }

    return this.buildUrl(this.identityProviderUrl, this.authorizeRoute) + '?' + params.join('&');
  }

  getLogoutUrl(state: string) {
    return this.buildUrl(this.identityProviderUrl, this.logoutRoute) + '?' +
      'post_logout_redirect_uri=' + encodeURIComponent(this.clientRedirectUrl) + '&' +
      'state=' + encodeURIComponent(state);    
  }

  private buildUrl(base: string, path: string): string {
    if (base && base.lastIndexOf('/') === base.length - 1) {
      base = base.substring(0, base.length - 1);
    }
    if (path && path.indexOf('/') === 0) {
      path = path.substring(1);
    }
    return (base || '') + '/' + (path || '');
  }

}