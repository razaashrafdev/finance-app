export type AuthLinkParams = {
  accessToken: string;
  refreshToken: string;
  type: string;
};

function pick(params: URLSearchParams, key: string) {
  return params.get(key) || '';
}

export function readAuthLink(url: string): AuthLinkParams {
  const hash = url.includes('#') ? url.slice(url.indexOf('#') + 1) : '';
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1).split('#')[0] : '';
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(query);
  const read = (key: string) => pick(queryParams, key) || pick(hashParams, key);

  return {
    accessToken: read('access_token'),
    refreshToken: read('refresh_token'),
    type: read('type'),
  };
}
