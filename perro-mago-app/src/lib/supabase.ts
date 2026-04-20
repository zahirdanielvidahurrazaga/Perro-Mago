import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si faltan las variables de entorno, activamos el Modo Demo automáticamente
export const IS_DEMO_MODE = !supabaseUrl || !supabaseAnonKey || import.meta.env.VITE_DEMO_MODE === 'true';

if (IS_DEMO_MODE) {
  console.warn(
    'PERRO MAGO: Entrando en MODO DEMO. Los datos se guardarán localmente en este navegador.'
  );
}

// Cliente Dummy para evitar errores si algo intenta llamar a supabase en modo demo
const dummyClient = {
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
          then: (cb: any) => cb({ data: [], error: null })
        }),
        then: (cb: any) => cb({ data: [], error: null })
      }),
      order: () => Promise.resolve({ data: [], error: null }),
      then: (cb: any) => cb({ data: [], error: null })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: {}, error: null })
      })
    })
  }),
  rpc: () => Promise.resolve({ data: null, error: null }),
  channel: () => ({
    on: () => ({
      on: () => ({
        on: () => ({
          subscribe: () => ({})
        })
      })
    })
  }),
  removeChannel: () => {}
} as any;

export const supabase = !IS_DEMO_MODE 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : dummyClient;


