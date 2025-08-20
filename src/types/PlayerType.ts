// Interfaz principal del jugador (coincide con la API real)
export interface Player {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  position: string
  jerseyNumber: number
  isActive: boolean
  teamId: number
  profilePhotoPath: string | null
  // Alias para compatibilidad con la UI existente
  photoPath?: string | null
  // Campos adicionales para la UI (opcionales para mantener compatibilidad)
  identificationNumber?: string
  epsProvider?: string
  createdAt: string
  updatedAt: string
  team?: {
    id: number
    name: string
    logoPath: string | null
  }
}

// Interfaz para crear un nuevo jugador
export interface CreatePlayerRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  position?: string // Hacer opcional para evitar errores
  jerseyNumber: number
  teamId: number
  // Campos opcionales para compatibilidad
  identificationNumber?: string
  epsProvider?: string
}

// Interfaz para actualizar un jugador
export interface UpdatePlayerRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  position?: string
  jerseyNumber?: number
  // Campos opcionales para compatibilidad
  identificationNumber?: string
  epsProvider?: string
}

// Interfaz para la respuesta de crear jugador
export interface CreatePlayerResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  position: string
  jerseyNumber: number
  isActive: boolean
  teamId: number
  profilePhotoPath: string | null
  createdAt: string
  updatedAt: string
}

// Interfaz para la respuesta de obtener jugadores
export type GetPlayersResponse = Player[]

// Tipos específicos para Match Versus
export interface PlayerFormation {
  player: Player
  x: number // Posición X en el campo (0-100%)
  y: number // Posición Y en el campo (0-100%)
}

export interface TeamLineup {
  teamId: number
  teamName: string
  teamLogo?: string
  formation: string // Ej: "4-4-2", "3-5-2", "4-3-3"
  players: PlayerFormation[]
}

export interface MatchVersus {
  matchId: number
  homeTeam: TeamLineup
  awayTeam: TeamLineup
  matchDate?: string
  stadium?: string
}

// Posiciones predefinidas para diferentes formaciones tácticas
export const FORMATIONS = {
  '4-4-2': [
    // Portero
    { x: 50, y: 90 },
    // Defensas
    { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
    // Mediocampo
    { x: 25, y: 55 }, { x: 45, y: 55 }, { x: 55, y: 55 }, { x: 75, y: 55 },
    // Delanteros
    { x: 35, y: 25 }, { x: 65, y: 25 }
  ],
  '4-3-3': [
    // Portero
    { x: 50, y: 90 },
    // Defensas
    { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 },
    // Mediocampo
    { x: 35, y: 55 }, { x: 50, y: 55 }, { x: 65, y: 55 },
    // Delanteros
    { x: 25, y: 25 }, { x: 50, y: 25 }, { x: 75, y: 25 }
  ],
  '3-5-2': [
    // Portero
    { x: 50, y: 90 },
    // Defensas
    { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 },
    // Mediocampo
    { x: 15, y: 55 }, { x: 35, y: 55 }, { x: 50, y: 55 }, { x: 65, y: 55 }, { x: 85, y: 55 },
    // Delanteros
    { x: 40, y: 25 }, { x: 60, y: 25 }
  ],
  '5-3-2': [
    // Portero
    { x: 50, y: 90 },
    // Defensas
    { x: 15, y: 75 }, { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 }, { x: 85, y: 75 },
    // Mediocampo
    { x: 35, y: 55 }, { x: 50, y: 55 }, { x: 65, y: 55 },
    // Delanteros
    { x: 40, y: 25 }, { x: 60, y: 25 }
  ]
} as const

export type FormationType = keyof typeof FORMATIONS
