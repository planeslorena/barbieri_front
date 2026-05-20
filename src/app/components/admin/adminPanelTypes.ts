import type {
  CategoriaServicioAdmin,
  ClienteAdmin,
  ProfesionalAdmin,
  ServicioAdmin,
  UsuarioAdmin,
} from '@/app/types/admin';

export interface CommonPanelProps {
  servicios: ServicioAdmin[];
  categorias: CategoriaServicioAdmin[];
  profesionales: ProfesionalAdmin[];
  clientes: ClienteAdmin[];
  administradores: UsuarioAdmin[];
  reloadAll: () => Promise<void>;
  refreshKey?: number;
}
