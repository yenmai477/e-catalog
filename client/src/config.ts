// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'dkzgr3dsul'
const region = 'us-west-2'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-056de2-1.us.auth0.com',            // Auth0 domain
  clientId: '1dwqeJG4ocUX0qFqorTQiC5HATNHJYPF',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
