export const API_URL: string = "http://localhost:8080/api";

export const FetchFromApi = async <TResult>(
  endpoint: string,
  fetchOptions: RequestInit = {},
  fetcher?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  searchParams?: URLSearchParams,
  replay: boolean = false
): Promise<StandardResponseDto<TResult>> => {
  
  let usedFetcher = fetcher ?? fetch;
  let url = new URL(`${API_URL}/${endpoint}`);

  if (searchParams) {
    url.search = searchParams.toString();
  }

  const csrfToken = getCookie('csrf_token');
  
  let query = await usedFetcher(url.toString(), {
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
      ...(fetchOptions.headers || {}) 
    },
    ...fetchOptions,
  });
  
  
  if (!query.ok){
    if (query.status === 401){
      if (query.headers.get("X-Token-Expired") === "true"){
        if (!replay){
          let res = await FetchFromApi("auth/refresh", {
            method: "POST",
          }, fetcher, undefined, true);
          console.log(res);

          return await FetchFromApi(endpoint, fetchOptions, fetcher, searchParams, true);
        }
      }
    }
    throw new Error(`API Error ${query.status}: ${query.statusText}`);
  }
  let result = await query.json()
  console.log(result);

  return result;
};


const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
};


export type QueryResult = 'Success' | 'Warning' | 'Error';

export type StandardResponseDto<T = {}> = {
  status: QueryResult;
  message: string | null;
  body: T;
};