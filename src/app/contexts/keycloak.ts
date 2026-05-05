import Keycloak from "keycloak-js";

const KEYCLOAK_URL = (import.meta.env.VITE_KEYCLOAK_URL as string) || "https://keycloak-production-7ec8.up.railway.app";
const KEYCLOAK_REALM = (import.meta.env.VITE_KEYCLOAK_REALM as string) || "deepskyn";
const KEYCLOAK_CLIENT_ID = (import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string) || "frontend";

const keycloak = new Keycloak({
  url: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
});

export default keycloak;