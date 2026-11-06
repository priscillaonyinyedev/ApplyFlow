const url=(import.meta.env.VITE_SUPABASE_URL||'').replace(/\/$/,'');
const anonKey=import.meta.env.VITE_SUPABASE_ANON_KEY||'';
export const hasSupabaseConfig=Boolean(url&&anonKey&&!url.includes('your-project'));

class SupabaseRestClient{
  constructor(){
    this.session=this.readSession();this.listeners=new Set();this.lastEvent=null;this.ready=this.readRedirect();
    if(typeof window!=='undefined')this.refreshTimer=window.setInterval(()=>{if(this.session?.expires_at<Date.now()/1000+90)this.refreshSession()},60000);
  }
  readSession(){try{return JSON.parse(localStorage.getItem('applyflow-auth-session')||'null')}catch{return null}}
  storeSession(session){this.session=session;if(session)localStorage.setItem('applyflow-auth-session',JSON.stringify(session));else localStorage.removeItem('applyflow-auth-session')}
  notify(event,session=this.session){this.lastEvent=event;for(const listener of this.listeners)listener(event,session)}
  async request(path,{method='GET',body,token,skipBearer=false,headers={}}={}){
    try{const requestHeaders={apikey:anonKey,'Content-Type':'application/json',...headers};const bearer=skipBearer?null:(token||this.session?.access_token);if(bearer)requestHeaders.Authorization=`Bearer ${bearer}`;const response=await fetch(`${url}${path}`,{method,headers:requestHeaders,body:body===undefined?undefined:JSON.stringify(body)});const text=await response.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!response.ok)return {data:null,error:{message:data?.msg||data?.message||data?.error_description||data?.error||`Request failed (${response.status})`,status:response.status,details:data}};return {data,error:null}}catch(error){return {data:null,error:{message:error.message||'Network request failed'}}}
  }
  normalizeSession(data){if(!data?.access_token)return null;return {...data,expires_at:data.expires_at||Math.floor(Date.now()/1000)+(data.expires_in||3600)}}
  async readRedirect(){if(typeof window==='undefined'||!window.location.hash)return;const params=new URLSearchParams(window.location.hash.slice(1));const accessToken=params.get('access_token');const refreshToken=params.get('refresh_token');if(!accessToken)return;const {data,error}=await this.request('/auth/v1/user',{token:accessToken});if(!error){this.storeSession(this.normalizeSession({access_token:accessToken,refresh_token:refreshToken,expires_in:Number(params.get('expires_in')||3600),user:data}));this.notify(params.get('type')==='recovery'?'PASSWORD_RECOVERY':'SIGNED_IN')}window.history.replaceState({},document.title,window.location.pathname+window.location.search)}
  async refreshSession(){if(!this.session?.refresh_token)return {data:{session:null},error:null};const {data,error}=await this.request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:this.session.refresh_token},skipBearer:true});if(error){this.storeSession(null);this.notify('SIGNED_OUT',null);return {data:{session:null},error}}const session=this.normalizeSession(data);this.storeSession(session);this.notify('TOKEN_REFRESHED',session);return {data:{session},error:null}}
  async getSession(){await this.ready;if(this.session?.expires_at<Date.now()/1000+60)await this.refreshSession();return {data:{session:this.session},error:null}}
  auth={
    getSession:()=>this.getSession(),
    onAuthStateChange:(callback)=>{this.listeners.add(callback);this.getSession().then(({data})=>{if(this.listeners.has(callback)){callback(this.lastEvent||'INITIAL_SESSION',data.session);this.lastEvent=null}});return {data:{subscription:{unsubscribe:()=>this.listeners.delete(callback)}}}},
    signUp:async({email,password,options={}})=>{const {data,error}=await this.request('/auth/v1/signup',{method:'POST',body:{email,password,data:options.data||{}},skipBearer:true});if(error)return {data:null,error};const session=this.normalizeSession(data);if(session){this.storeSession(session);this.notify('SIGNED_IN',session)}return {data:{user:data?.user||data,session},error:null}},
    signInWithPassword:async({email,password})=>{const {data,error}=await this.request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password},skipBearer:true});if(error)return {data:null,error};const session=this.normalizeSession(data);this.storeSession(session);this.notify('SIGNED_IN',session);return {data:{user:session?.user,session},error:null}},
    resetPasswordForEmail:async(email,options={})=>this.request(`/auth/v1/recover${options.redirectTo?`?redirect_to=${encodeURIComponent(options.redirectTo)}`:''}`,{method:'POST',body:{email},skipBearer:true}),
    updateUser:async(attributes)=>{const {data,error}=await this.request('/auth/v1/user',{method:'PUT',body:attributes});if(!error&&this.session){this.session={...this.session,user:data};this.storeSession(this.session);this.notify('USER_UPDATED',this.session)}return {data:{user:data},error}},
    signOut:async()=>{const {error}=await this.request('/auth/v1/logout',{method:'POST'});this.storeSession(null);this.notify('SIGNED_OUT',null);return {error}}
  };
  from(table){return new RestQuery(this,table)}
}

class RestQuery{
  constructor(client,table){this.client=client;this.table=table;this.method='GET';this.params=new URLSearchParams();this.body=undefined;this.prefer='';this.single=false}
  select(columns='*'){this.params.set('select',columns);return this}
  upsert(body){this.method='POST';this.body=body;this.prefer='resolution=merge-duplicates,return=minimal';return this}
  delete(){this.method='DELETE';this.prefer='return=minimal';return this}
  eq(column,value){this.params.set(column,`eq.${value}`);return this}
  order(column,{ascending=true}={}){this.params.set('order',`${column}.${ascending?'asc':'desc'}`);return this}
  maybeSingle(){this.single=true;this.params.set('limit','1');return this.execute()}
  async execute(){const query=this.params.toString();const {data,error}=await this.client.request(`/rest/v1/${encodeURIComponent(this.table)}${query?`?${query}`:''}`,{method:this.method,body:this.body,headers:this.prefer?{Prefer:this.prefer}:{}});if(error)return {data:null,error};if(this.single)return {data:Array.isArray(data)?data[0]||null:data,error:null};return {data,error:null}}
  then(resolve,reject){return this.execute().then(resolve,reject)}
}

export const supabase=hasSupabaseConfig?new SupabaseRestClient():null;
