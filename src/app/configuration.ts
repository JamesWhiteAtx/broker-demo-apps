export class Configuration {
  /**
   *
   */
  constructor(
    public identityProviderUrl: string,
    public resourceServerUrl: string,
    public authorizeRoute: string,
    public logoutRoute: string,
    public clientRedirectUrl: string,
    public clientID: string,
    public scopes: string[],
    public acrValues: string[]
  ) {
    
    
  }
}