export type EndpointType = 'concept' | 'connection'

export interface IConnection {
  id: number
  label: string
  from: number
  to: number
  fromType?: EndpointType
  toType?: EndpointType
  extraTargets?: number[]
  width: string
}
