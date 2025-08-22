// Tipos para la API de torneos
export interface TournamentCategory {
  id: number
  tournamentId: number
  categoryId: number
  category: {
    id: number
    name: string
    description: string
    createdAt: string
    updatedAt: string
  }
}

export interface TournamentGroup {
  id: string | number
  name: string
  teams: number[] // Array de IDs de equipos
  groupName?: string // Para compatibilidad con backend
  groupOrder?: number // Para compatibilidad con backend
  tournamentId?: number // Para backend
  createdAt?: string // Para backend
  updatedAt?: string // Para backend
}

export interface TeamAssignment {
  teamId: number
  groupName?: string // Para frontend
  groupId?: number // Para backend
  id?: number // Para backend
  tournamentId?: number // Para backend
  assignedAt?: string // Para backend
}

export interface TournamentConfiguration {
  numberOfGroups: number
  teamsPerGroup: number
  groups: TournamentGroup[]
  isConfigured: boolean
  teamAssignments?: TeamAssignment[]
  id?: number // Para backend
  tournamentId?: number // Para backend
  createdAt?: string // Para backend
  updatedAt?: string // Para backend
}

export interface CreateTournamentConfigurationRequest {
  numberOfGroups: number
  teamsPerGroup: number
  teamAssignments?: TeamAssignment[]
}

export interface UpdateTournamentConfigurationRequest {
  numberOfGroups?: number
  teamsPerGroup?: number
  isConfigured?: boolean
  teamAssignments?: TeamAssignment[]
}

export interface Tournament {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  maxTeams: number
  isActive: boolean
  bannerPath: string | null
  createdAt: string
  updatedAt: string
  tournamentCategories: TournamentCategory[]
  configuration?: TournamentConfiguration
  // Propiedades adicionales para el sistema de grupos
  teamAssignments?: TeamAssignment[]
  groups?: TournamentGroup[]
}

export interface CreateTournamentRequest {
  name: string
  description: string
  startDate: string
  endDate: string
  maxTeams: number
  categoryIds: number[] // Array de IDs de categorías
}

export interface CreateTournamentResponse {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  maxTeams: number
  isActive: boolean
  bannerPath: string | null
  createdAt: string
  updatedAt: string
  tournamentCategories: TournamentCategory[]
}

export type GetTournamentsResponse = Array<Tournament>
