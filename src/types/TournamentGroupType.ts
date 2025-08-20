export interface TournamentGroup {
  id: number
  tournament_id: number
  group_name: string
  group_order: number
  created_at: string
  updated_at: string
}

export interface TournamentGroupWithTeams extends TournamentGroup {
  teams?: {
    id: number
    name: string
    logoPath?: string
  }[]
}
