import { HostingContract } from './HostingContract'
import { NDAContract } from './NDAContract'
import { GoogleWorkspaceContract } from './GoogleWorkspaceContract'
import { WebDesignContract } from './WebDesignContract'

export const allContracts = [
  WebDesignContract,
  HostingContract,
  GoogleWorkspaceContract,
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
