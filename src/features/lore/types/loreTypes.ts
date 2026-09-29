export interface Lore {
  id: number
  proposal_id: number
  proposer: string
  type: string
  status: LoreStatus
  title: string
  total_yes_votes: number
  total_no_votes: number
  number_yes_votes: number
  number_no_votes: number
  earliest_exec: string
  expires: string
  submitted: string
  attributes: Array<{
    key: string
    value: [string, string | number]
  }>
}

export enum LoreSortBy {
  ID,
  TITLE,
  CREATEDBY,
  SUBMITTED,
  EXPIREDATE,
  EARLIERST_EXEC,
  VOTES,
  STATUS,
}
export enum LoreTableColumns {
  ID = 'Id',
  TITLE = 'Title',
  CREATEDBY = 'Created by',
  SUBMITTED = 'Submitted',
  EXPIREDATE = 'Expiry Date',
  EARLIERST_EXEC = 'Earliest Exec',
  VOTES = 'Votes Y/N',
  STATUS = 'Status',
}

export enum LoreStatus {
  OPEN = 'open',
  PASSING = 'passing',
  FAILING = 'failing',
  QUORUM_UNMET = 'quorum.unmet',
  EXPIRED = 'expired',
  EXECUTED = 'executed',
  MERGED = 'merged',
  MINTPREP = 'mintprep',
  COMPLETE = 'complete',
}

export type LoreFilter = {
  sortBy: LoreSortBy
  reversed: boolean
}

/** The fields of a GitHub pull request (on the-lore repo) that lore reads. */
export interface LorePullRequest {
  number: number
  title: string
  html_url: string
}
