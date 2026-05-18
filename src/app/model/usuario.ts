export interface Usuario{
    id_usuario: number;
    dni: number;
    nombre: string;
    mail?: string | null;
    telefono: number;
    rol: string;
  }
