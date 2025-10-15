import { HostingContract } from './HostingContract'
import { NDAContract } from './NDAContract'

export const allContracts = [
  HostingContract,
  NDAContract
]

export const getContractConfig = (contractId) => {
  return allContracts.find(c => c.id === contractId) || allContracts[0]
}

export const getContractList = () => {
  return allContracts.map(contract => ({
    id: contract.id,
    name: contract.name
  }))
}