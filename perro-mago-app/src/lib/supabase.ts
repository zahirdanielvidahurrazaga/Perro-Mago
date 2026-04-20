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

export const supabase = !IS_DEMO_MODE 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : (null as any); // En modo demo, no usamos el cliente real

