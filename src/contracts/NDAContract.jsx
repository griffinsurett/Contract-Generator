import React from 'react'
import { useFormContext } from '../contexts/FormContext'

const NDASidebarForm = () => {
  const { formData, updateField } = useFormContext()

  return (
    <div>
      <h3 className="sidebar-section-title">Disclosing Party Information</h3>
      <div className="sidebar-section mb-8">
        <div>
          <label className="form-label">Contact Name</label>
          <input
            type="text"
            value={formData.disclosingPartyName}
            onChange={(e) => updateField('disclosingPartyName', e.target.value)}
            className="form-input"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="form-label">Company Name</label>
          <input
            type="text"
            value={formData.disclosingPartyCompany}
            onChange={(e) => updateField('disclosingPartyCompany', e.target.value)}
            className="form-input"
            placeholder="Disclosing Company Inc"
          />
        </div>
        <div>
          <label className="form-label">Address</label>
          <input
            type="text"
            value={formData.disclosingPartyAddress}
            onChange={(e) => updateField('disclosingPartyAddress', e.target.value)}
            className="form-input"
            placeholder="123 Business St, City, State, ZIP"
          />
        </div>
      </div>

      <div className="section-divider">
        <h3 className="sidebar-section-title">Receiving Party Information</h3>
        <div className="sidebar-section">
          <div>
            <label className="form-label">Contact Name</label>
            <input
              type="text"
              value={formData.receivingPartyName}
              onChange={(e) => updateField('receivingPartyName', e.target.value)}
              className="form-input"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="form-label">Company Name</label>
            <input
              type="text"
              value={formData.receivingPartyCompany}
              onChange={(e) => updateField('receivingPartyCompany', e.target.value)}
              className="form-input"
              placeholder="Receiving Company LLC"
            />
          </div>
          <div>
            <label className="form-label">Address</label>
            <input
              type="text"
              value={formData.receivingPartyAddress}
              onChange={(e) => updateField('receivingPartyAddress', e.target.value)}
              className="form-input"
              placeholder="456 Commerce Ave, City, State, ZIP"
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={formData.receivingPartyEmail}
              onChange={(e) => updateField('receivingPartyEmail', e.target.value)}
              className="form-input"
              placeholder="receiver@example.com"
            />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              value={formData.receivingPartyPhone}
              onChange={(e) => updateField('receivingPartyPhone', e.target.value)}
              className="form-input"
              placeholder="(555) 987-6543"
            />
          </div>
        </div>
      </div>

      <div className="section-divider mt-6">
        <h3 className="sidebar-section-title">Agreement Details</h3>
        <div className="sidebar-section">
          <div>
            <label className="form-label">Purpose of Disclosure</label>
            <input
              type="text"
              value={formData.purposeOfDisclosure}
              onChange={(e) => updateField('purposeOfDisclosure', e.target.value)}
              className="form-input"
              placeholder="e.g., evaluating potential partnership"
            />
          </div>
          <div>
            <label className="form-label">Governing State</label>
            <input
              type="text"
              value={formData.governingState}
              onChange={(e) => updateField('governingState', e.target.value)}
              className="form-input"
              placeholder="New Jersey"
            />
          </div>
          <div>
            <label className="form-label">Additional Terms (Optional)</label>
            <textarea
              value={formData.additionalTerms}
              onChange={(e) => updateField('additionalTerms', e.target.value)}
              className="form-textarea"
              placeholder="Enter any additional terms or clauses..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const NDADocument = () => {
  const { formData, updateField } = useFormContext()

  return (
    <div className="contract-doc">
      <h1 className="contract-h1">NON-DISCLOSURE AGREEMENT</h1>
      
      <p className="contract-p">
        This Non-Disclosure Agreement is entered into between:
      </p>
      
      <p className="contract-p">
        <strong>Disclosing Party:</strong>{' '}
        <input
          type="text"
          value={formData.disclosingPartyCompany}
          onChange={(e) => updateField('disclosingPartyCompany', e.target.value)}
          className="contract-input contract-input-long font-bold"
          placeholder="Disclosing Company"
        />
      </p>
      
      <p className="contract-p">
        <strong>Receiving Party:</strong>{' '}
        <input
          type="text"
          value={formData.receivingPartyCompany}
          onChange={(e) => updateField('receivingPartyCompany', e.target.value)}
          className="contract-input contract-input-long font-bold"
          placeholder="Receiving Company"
        />
      </p>
      
      <h2 className="contract-h2">1. PURPOSE</h2>
      <p className="contract-p">
        The purpose of this Agreement is to protect confidential information disclosed for:{' '}
        <input
          type="text"
          value={formData.purposeOfDisclosure}
          onChange={(e) => updateField('purposeOfDisclosure', e.target.value)}
          className="contract-input contract-input-xlong"
          placeholder="Purpose of disclosure"
        />
      </p>

      <h2 className="contract-h2">2. CONFIDENTIALITY OBLIGATIONS</h2>
      <p className="contract-p">
        The Receiving Party agrees to maintain the confidentiality of all information disclosed by the Disclosing Party and to use such information solely for the purpose stated above.
      </p>

      <h2 className="contract-h2">3. TERM</h2>
      <p className="contract-p">
        This Agreement shall remain in effect for{' '}
        <input
          type="text"
          value={formData.confidentialityPeriod}
          onChange={(e) => updateField('confidentialityPeriod', e.target.value)}
          className="contract-input w-[50px]"
        />
        {' '}{formData.confidentialityPeriodUnit} from the date of signing.
      </p>

      <h2 className="contract-h2">4. GOVERNING LAW</h2>
      <p className="contract-p">
        This Agreement shall be governed by the laws of{' '}
        <input
          type="text"
          value={formData.governingState}
          onChange={(e) => updateField('governingState', e.target.value)}
          className="contract-input w-[150px]"
        />.
      </p>

      {formData.additionalTerms && (
        <>
          <h2 className="contract-h2">5. ADDITIONAL TERMS</h2>
          <p className="contract-p">{formData.additionalTerms}</p>
        </>
      )}

      <div className="contract-signature-section">
        <div className="flex justify-between gap-10">
          <div className="flex-1">
            <p className="contract-p-bold mb-10">DISCLOSING PARTY</p>
            <p className="contract-p">Signature: _____________________</p>
            <p className="contract-p mt-5">Name: {formData.disclosingPartyName}</p>
            <p className="contract-p mt-2.5">Date: _______________</p>
          </div>
          <div className="flex-1">
            <p className="contract-p-bold mb-10">RECEIVING PARTY</p>
            <p className="contract-p">Signature: _____________________</p>
            <p className="contract-p mt-5">Name: {formData.receivingPartyName}</p>
            <p className="contract-p mt-2.5">Date: _______________</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const NDAContract = {
  id: 'nda',
  name: 'Non-Disclosure Agreement (NDA)',
  defaultFields: {
    disclosingPartyName: '',
    disclosingPartyCompany: '',
    disclosingPartyAddress: '',
    receivingPartyName: '',
    receivingPartyCompany: '',
    receivingPartyAddress: '',
    receivingPartyEmail: '',
    receivingPartyPhone: '',
    day: '',
    month: '',
    year: '',
    purposeOfDisclosure: '',
    confidentialityPeriod: '2',
    confidentialityPeriodUnit: 'years',
    allowEmployeeDisclosure: true,
    allowLegalDisclosure: true,
    allowPriorKnowledge: true,
    returnMaterials: true,
    notifyBreach: true,
    governingState: 'New Jersey',
    disputeResolution: 'mediation',
    additionalTerms: ''
  },
  SidebarForm: NDASidebarForm,
  Document: NDADocument
}