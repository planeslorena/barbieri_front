import type {
  CategoriaServicioAdmin,
  ClienteAdmin,
  ProfesionalAdmin,
  ServicioAdmin,
} from '@/app/types/admin';

export interface CommonPanelProps {
  servicios: ServicioAdmin[];
  categorias: CategoriaServicioAdmin[];
  profesionales: ProfesionalAdmin[];
  clientes: ClienteAdmin[];
  reloadAll: () => Promise<void>;
}
