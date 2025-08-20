export interface Fixture {
  id?: number
  tournamentId: number
  homeTeamId: number
  awayTeamId: number
  homeTeam?: {
    id: number
    name: string
  }
  awayTeam?: {
    id: number
    name: string
  }
  date: string
  time: string
  location?: string // Cambiar venue por location para coincidir con el backend
  round?: number | string
  group?: string
  groupId?: string
  status?: 'scheduled' | 'completed' | 'cancelled'
  homeScore?: number
  awayScore?: number
  createdAt?: string
  updatedAt?: string
}

export interface FixtureConfiguration {
  tournamentId: number
  fixtureType: 'round_robin' | 'knockout' | 'group_stage'
  startDate: string
  location?: string // Cambiar venue por location
  fixtures: Omit<Fixture, 'id' | 'tournamentId'>[]
}

export interface FixtureGenerationRequest {
  tournamentId: number
  fixtureType: 'round_robin' | 'knockout' | 'group_stage'
  startDate: string
  location?: string // Cambiar venue por location
}

export interface FixtureResponse {
  success: boolean
  message: string
  data: any[] // Flexible para manejar tanto Fixtures como Matches
  timestamp: string
  statusCode: number
}
