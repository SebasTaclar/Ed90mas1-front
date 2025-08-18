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
  venue?: string
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
  venue?: string
  fixtures: Omit<Fixture, 'id' | 'tournamentId'>[]
}

export interface FixtureGenerationRequest {
  tournamentId: number
  fixtureType: 'round_robin' | 'knockout' | 'group_stage'
  startDate: string
  venue?: string
}

export interface FixtureResponse {
  fixtures: Fixture[]
  totalMatches: number
  tournamentId: number
}
