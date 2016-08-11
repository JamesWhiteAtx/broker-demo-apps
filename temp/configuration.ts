export class Configuration {
  responseType: string

  constructor(
    public identityProviderUrl: string,
    public resourceServerUrl: string,
    public authorizeRoute: string,
    public logoutRoute: string,
    public clientRedirectUrl: string,
    public clientID: string,
    public scopes: string[],
    public acrValues: string[]) {

    this.responseType = 'token id_token';
  }

  getAuthorizeUrl(state: string) {
    return this.buildUrl(this.identityProviderUrl, this.authorizeRoute) + '?' +
      'response_type=' + encodeURIComponent(this.responseType) + '&' +
      'client_id=' + encodeURIComponent(this.clientID) + '&' +
      'redirect_uri=' + encodeURIComponent(this.clientRedirectUrl) + '&' +
      'scope=' + encodeURIComponent(this.scopes.join(' ')) + '&' +
      'acr_values=' + encodeURIComponent(this.acrValues.join(' ')) + '&' +
      'nonce=' + encodeURIComponent(state) + '&' +
      'state=' + encodeURIComponent(state);
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