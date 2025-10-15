import React from 'react'
import { getContractConfig } from '../contracts'

const FormSidebar = ({ isOpen, onClose, currentContract }) => {
  const contractConfig = getContractConfig(currentContract)
  const SidebarFormComponent = contractConfig.SidebarForm

  return (
    <div className={`sidebar ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="sidebar-header">
        <div className="flex items-center justify-between mb-2">
          <h2 className="sidebar-title">Party Information</h2>
          <button onClick={onClose} className="sidebar-close-btn">✕</button>
        </div>
        <p className="sidebar-subtitle">Fill in the contract details</p>
      </div>

      <div className="sidebar-content">
        <SidebarFormComponent />
      </div>
    </div>
  )
}

export default FormSidebar