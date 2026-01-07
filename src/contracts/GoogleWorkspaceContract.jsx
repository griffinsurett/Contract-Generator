import React from "react";
import { useFormContext } from "../contexts/FormContext";
import { generateDocument } from "../utils/documentGenerator";
import { getTodayDate, formatDateToFields } from "../utils/dateUtils";

const currentDate = formatDateToFields(getTodayDate());

export const GoogleWorkspaceSidebarForm = ({ page = 'provider' }) => {
  const { formData, updateField } = useFormContext();

  if (page === 'provider') {
    return (
      <div>
        <h3 className="sidebar-section-title">Service Provider Information</h3>
        <div className="sidebar-section">
          <div>
            <label className="form-label">Legal Name</label>
            <input
              type="text"
              value={formData.serviceProviderLegalName}
              onChange={(e) =>
                updateField("serviceProviderLegalName", e.target.value)
              }
              className="form-input"
              placeholder="Service Provider Legal Name"
            />
          </div>
          <div>
            <label className="form-label">Entity Type & Jurisdiction</label>
            <input
              type="text"
              value={formData.serviceProviderEntity}
              onChange={(e) => updateField("serviceProviderEntity", e.target.value)}
              className="form-input"
              placeholder="LLC organized in New Jersey"
            />
          </div>
          <div>
            <label className="form-label">Business Address</label>
            <input
              type="text"
              value={formData.serviceProviderAddress}
              onChange={(e) =>
                updateField("serviceProviderAddress", e.target.value)
              }
              className="form-input"
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>
          <div>
            <label className="form-label">Service Hours & Time Zone</label>
            <input
              type="text"
              value={formData.serviceHours}
              onChange={(e) => updateField("serviceHours", e.target.value)}
              className="form-input"
              placeholder="Mon–Fri, 9:00 AM – 5:00 PM ET"
            />
          </div>
          <div>
            <label className="form-label">Request Channel</label>
            <input
              type="text"
              value={formData.requestChannel}
              onChange={(e) => updateField("requestChannel", e.target.value)}
              className="form-input"
              placeholder="support@provider.com"
            />
          </div>
        </div>

        <div className="section-divider mt-6">
          <h3 className="sidebar-section-title">Fees & Billing</h3>
          <div className="sidebar-section">
            <div>
              <label className="form-label">Monthly Service Fee</label>
              <input
                type="text"
                value={formData.serviceFee}
                onChange={(e) => updateField("serviceFee", e.target.value)}
                className="form-input"
                placeholder="120.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Included Billable Users</label>
                <input
                  type="number"
                  value={formData.includedUsers}
                  onChange={(e) => updateField("includedUsers", e.target.value)}
                  className="form-input"
                  placeholder="30"
                  min="0"
                />
              </div>
              <div>
                <label className="form-label">Per-User Fee Above Included</label>
                <input
                  type="text"
                  value={formData.perUserFee}
                  onChange={(e) => updateField("perUserFee", e.target.value)}
                  className="form-input"
                  placeholder="4.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Payment Due (Days)</label>
                <input
                  type="number"
                  value={formData.paymentDueDays}
                  onChange={(e) => updateField("paymentDueDays", e.target.value)}
                  className="form-input"
                  placeholder="15"
                  min="0"
                />
              </div>
              <div>
                <label className="form-label">Late Fee (% per month)</label>
                <input
                  type="text"
                  value={formData.lateFeePercent}
                  onChange={(e) => updateField("lateFeePercent", e.target.value)}
                  className="form-input"
                  placeholder="1.5"
                />
              </div>
            </div>
            <div>
              <label className="form-label">User Count Date</label>
              <input
                type="text"
                value={formData.userCountDate}
                onChange={(e) => updateField("userCountDate", e.target.value)}
                className="form-input"
                placeholder="last calendar day of the prior month"
              />
            </div>
          </div>
        </div>

        <div className="section-divider mt-6">
          <h3 className="sidebar-section-title">Legal Settings</h3>
          <div className="sidebar-section">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Governing State</label>
                <input
                  type="text"
                  value={formData.governingState}
                  onChange={(e) => updateField("governingState", e.target.value)}
                  className="form-input"
                  placeholder="New Jersey"
                />
              </div>
              <div>
                <label className="form-label">Governing County</label>
                <input
                  type="text"
                  value={formData.governingCounty}
                  onChange={(e) => updateField("governingCounty", e.target.value)}
                  className="form-input"
                  placeholder="Monmouth County"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Termination Notice (Days)</label>
                <input
                  type="number"
                  value={formData.terminationNoticeDays}
                  onChange={(e) =>
                    updateField("terminationNoticeDays", e.target.value)
                  }
                  className="form-input"
                  placeholder="30"
                  min="0"
                />
              </div>
              <div>
                <label className="form-label">Rate Change Notice (Days)</label>
                <input
                  type="number"
                  value={formData.rateChangeNoticeDays}
                  onChange={(e) =>
                    updateField("rateChangeNoticeDays", e.target.value)
                  }
                  className="form-input"
                  placeholder="60"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Response Target (Hours)</label>
              <input
                type="number"
                value={formData.responseHours}
                onChange={(e) => updateField("responseHours", e.target.value)}
                className="form-input"
                placeholder="48"
                min="1"
              />
            </div>
            <div>
              <label className="form-label">Service Provider Admin Account</label>
              <input
                type="email"
                value={formData.serviceProviderAccountEmail}
                onChange={(e) =>
                  updateField("serviceProviderAccountEmail", e.target.value)
                }
                className="form-input"
                placeholder="admin@provider-domain.com"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client page
  return (
    <div>
      <h3 className="sidebar-section-title">Client Information</h3>
      <div className="sidebar-section">
        <div>
          <label className="form-label">Legal Name</label>
          <input
            type="text"
            value={formData.clientLegalName}
            onChange={(e) => updateField("clientLegalName", e.target.value)}
            className="form-input"
            placeholder="Client Legal Name"
          />
        </div>
        <div>
          <label className="form-label">Entity Type & Jurisdiction</label>
          <input
            type="text"
            value={formData.clientEntity}
            onChange={(e) => updateField("clientEntity", e.target.value)}
            className="form-input"
            placeholder="Corporation organized in New York"
          />
        </div>
        <div>
          <label className="form-label">Business Address</label>
          <input
            type="text"
            value={formData.clientAddress}
            onChange={(e) => updateField("clientAddress", e.target.value)}
            className="form-input"
            placeholder="456 Commerce Ave, City, State, ZIP"
          />
        </div>
        <div>
          <label className="form-label">Owner Account Email(s)</label>
          <textarea
            value={formData.ownerAccountEmails}
            onChange={(e) => updateField("ownerAccountEmails", e.target.value)}
            className="form-textarea"
            placeholder="owner@client-domain.com"
          />
        </div>
      </div>
    </div>
  );
};

const GoogleWorkspaceDocument = () => {
  const { formData, updateField } = useFormContext();

  const handleDateChange = (value) => {
    const dateFields = formatDateToFields(value);
    updateField("day", dateFields.day);
    updateField("month", dateFields.month);
    updateField("year", dateFields.year);
  };

  return (
    <div className="contract-doc">
      <h1 className="contract-h1">GOOGLE WORKSPACE MANAGEMENT AGREEMENT</h1>

      <p className="contract-p">
        This Google Workspace Management Agreement (the "Agreement") is made as
        of this{" "}
        <input
          type="text"
          value={formData.day}
          onChange={(e) => updateField("day", e.target.value)}
          className="contract-input-short"
        />{" "}
        day of{" "}
        <input
          type="text"
          value={formData.month}
          onChange={(e) => updateField("month", e.target.value)}
          className="contract-input-medium"
        />
        ,{" "}
        <input
          type="text"
          value={formData.year}
          onChange={(e) => updateField("year", e.target.value)}
          className="contract-input w-[50px]"
        />{" "}
        <span className="text-[10pt] text-gray-600 ml-2">
          (or select:
          <input
            type="date"
            defaultValue={getTodayDate()}
            onChange={(e) => handleDateChange(e.target.value)}
            className="contract-date-picker"
          />
          )
        </span>
        {" "}
        (the "Effective Date") by and between:
      </p>

      <p className="contract-p">
        <input
          type="text"
          value={formData.serviceProviderLegalName}
          onChange={(e) =>
            updateField("serviceProviderLegalName", e.target.value)
          }
          placeholder="Service Provider Legal Name"
          className="contract-input-inline contract-input-long"
        />
        , of {" "}
        <input
          type="text"
          value={formData.serviceProviderEntity}
          onChange={(e) => updateField("serviceProviderEntity", e.target.value)}
          placeholder="entity type & jurisdiction"
          className="contract-input-inline contract-input-long"
        />{" "}
        with its principal place of business at{" "}
        <input
          type="text"
          value={formData.serviceProviderAddress}
          onChange={(e) =>
            updateField("serviceProviderAddress", e.target.value)
          }
          placeholder="address"
          className="contract-input-inline contract-input-long"
        />{" "}
        ("Service Provider"), and
      </p>

      <p className="contract-p">
        <input
          type="text"
          value={formData.clientLegalName}
          onChange={(e) => updateField("clientLegalName", e.target.value)}
          placeholder="Client Legal Name"
          className="contract-input-inline contract-input-long"
        />
        , of {" "}
        <input
          type="text"
          value={formData.clientEntity}
          onChange={(e) => updateField("clientEntity", e.target.value)}
          placeholder="entity type & jurisdiction"
          className="contract-input-inline contract-input-long"
        />{" "}
        with its principal place of business at{" "}
        <input
          type="text"
          value={formData.clientAddress}
          onChange={(e) => updateField("clientAddress", e.target.value)}
          placeholder="address"
          className="contract-input-inline contract-input-long"
        />{" "}
        ("Client").
      </p>

      <p className="contract-p">
        Service Provider and Client are each a "Party" and together the
        "Parties."
      </p>

      <h2 className="contract-h2">PURPOSE & RELATIONSHIP TO GOOGLE</h2>

      <p className="contract-p">
        <strong>1.1 Purpose.</strong> Client engages Service Provider to provide
        ongoing administrative and management services for Client's Google
        Workspace tenant (the "Services") on a recurring monthly basis, and
        Service Provider agrees to provide such Services under the terms of this
        Agreement. The core Services primarily consist of creating, updating,
        and deleting Google Workspace user accounts, and assisting users with
        logins and passwords, as further described in Schedule A.
      </p>

      <p className="contract-p">
        <strong>1.2 Separate Google Contract.</strong> Client's use of Google
        Workspace is governed solely by Client's separate agreement(s) with
        Google LLC or an authorized Google reseller ("Google Agreement"). This
        Agreement does not replace or modify the Google Agreement.
      </p>

      <p className="contract-p">
        <strong>1.3 Separation of Fees.</strong>
      </p>
      <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
        <li>
          Client pays Google (or its reseller) directly for all Google Workspace
          licenses, subscriptions, and related charges ("Google Fees"),
          including the license associated with the Service Provider Account
          listed in Schedule B.
        </li>
        <li>
          Client pays Service Provider separately for the Services under this
          Agreement ("Management Fees").
        </li>
        <li>
          Termination or expiration of this Agreement does not cancel, suspend,
          or alter Client's Google Workspace subscriptions.
        </li>
      </ul>

      <h2 className="contract-h2">DEFINITIONS</h2>

      <p className="contract-p">
        <strong>2.1 "Google Workspace"</strong> means the cloud-based
        productivity suite and related services provided by Google, as defined
        in the Google Agreement.
      </p>
      <p className="contract-p">
        <strong>2.2 "Environment"</strong> means Client's Google Workspace
        tenant, including its users, groups, organizational units, policies, and
        settings for which Service Provider is granted administrative rights.
      </p>
      <p className="contract-p">
        <strong>2.3 "Client Data"</strong> means any data, content, or
        information input, uploaded, or otherwise processed in the Environment
        on behalf of Client.
      </p>
      <p className="contract-p">
        <strong>2.4 "Authorized Contact(s)"</strong> means the individual(s)
        designated in writing by Client to request and approve changes to the
        Environment.
      </p>
      <p className="contract-p">
        <strong>2.5 "Service Provider Account"</strong> means the Google
        Workspace user account used solely by Service Provider (or its
        personnel) to administer the Environment in performance of the Services.
      </p>
      <p className="contract-p">
        <strong>2.6 "Owner Account(s)"</strong> means the Client's ownership or
        principal accounts used by the business owner(s) for management purposes
        and identified by email address in Schedule B (Fees).
      </p>
      <p className="contract-p">
        <strong>2.7 "Billable User"</strong> means any active Google Workspace
        user account in the Environment other than the Service Provider Account.
      </p>
      <p className="contract-p">
        <strong>2.8 "Billable User Count"</strong> means the total number of
        Billable Users in the Environment as of the User Count Date defined in
        Section 5.3.
      </p>
      <p className="contract-p">
        <strong>2.9 "Monthly Management Fee"</strong> means the total monthly
        Management Fees payable by Client to Service Provider as calculated
        under Section 5.
      </p>

      <h2 className="contract-h2">SERVICES</h2>

      <p className="contract-p">
        <strong>3.1 Scope of Services.</strong> Subject to this Agreement,
        Service Provider shall provide the Services described in Schedule A
        (Scope of Services), which include, at a minimum:
      </p>
      <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
        <li>Creating Google Workspace user accounts on Client's written instruction;</li>
        <li>Modifying or updating Google Workspace user accounts on Client's written instruction;</li>
        <li>Suspending and/or deleting Google Workspace user accounts on Client's written instruction;</li>
        <li>Assisting users with login issues and password resets within the Google Workspace Admin Console.</li>
      </ul>

      <p className="contract-p">
        <strong>3.2 Exclusions.</strong> Unless explicitly stated in Schedule A
        or another written addendum signed by both Parties, the Services do not
        include:
      </p>
      <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
        <li>Legal, compliance, HR, or tax advice;</li>
        <li>Advanced cybersecurity services (e.g., security monitoring, SIEM, penetration testing, incident response);</li>
        <li>Data backup and recovery beyond what is natively provided by Google Workspace;</li>
        <li>Custom software development, custom scripting, or integrations not specified in Schedule A;</li>
        <li>On-site support;</li>
        <li>Any services or tasks not expressly identified in this Agreement or in Schedule A.</li>
      </ul>

      <p className="contract-p">
        <strong>3.3 Service Hours.</strong> Unless otherwise stated in Schedule
        A, Services will be provided during{" "}
        <input
          type="text"
          value={formData.serviceHours}
          onChange={(e) => updateField("serviceHours", e.target.value)}
          className="contract-input-inline contract-input-long"
          placeholder="standard business hours and time zone"
        />{" "}
        excluding weekends and public holidays.
      </p>

      <p className="contract-p">
        <strong>3.4 Service Requests.</strong> Client shall submit all requests
        through{" "}
        <input
          type="text"
          value={formData.requestChannel}
          onChange={(e) => updateField("requestChannel", e.target.value)}
          className="contract-input-inline contract-input-long"
          placeholder="designated system or email"
        />
        . Service Provider may rely on any request that reasonably appears to
        come from an Authorized Contact and is not responsible for actions taken
        in good-faith reliance on such requests.
      </p>

      <p className="contract-p">
        <strong>3.5 Changes to Services.</strong> Service Provider may modify
        the methodology or tools used to deliver the Services, provided the
        overall scope and quality of Services are not materially degraded. Any
        material change in scope or pricing shall be agreed in writing.
      </p>

      <p className="contract-p">
        <strong>3.6 Response and Completion Time.</strong> Service Provider will
        use commercially reasonable efforts to:
      </p>
      <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
        <li>
          Begin addressing each valid change request (such as user creation,
          update, deletion, or login/password assistance) within{" "}
          <input
            type="number"
            value={formData.responseHours}
            onChange={(e) => updateField("responseHours", e.target.value)}
            className="contract-input-inline w-[70px]"
            min="1"
          />{" "}
          hours of receipt during Service Provider's standard business hours; and
        </li>
        <li>
          Either complete the requested change within that timeframe or alert
          Client within the same{" "}
          <span className="font-bold">{formData.responseHours}</span>{" "}
          hour period if additional time, clarification, or approvals are
          required.
        </li>
      </ul>
      <p className="contract-p">
        These timeframes are target service levels and not guarantees of
        resolution.
      </p>

      <h2 className="contract-h2">CLIENT OBLIGATIONS</h2>

      <p className="contract-p">
        <strong>4.1 Access &amp; Cooperation.</strong> Client shall:
      </p>
      <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
        <li>Provide Service Provider with necessary administrative access to the Environment;</li>
        <li>Ensure Authorized Contacts are available to provide timely approvals and information;</li>
        <li>Notify Service Provider promptly of changes to Authorized Contacts.</li>
      </ul>

      <p className="contract-p">
        <strong>4.2 Accuracy of Instructions.</strong> Client is responsible for
        the clarity, accuracy, and legality of all instructions to Service
        Provider. Service Provider is not liable for issues arising from
        inaccurate, incomplete, or unauthorized instructions where Service
        Provider reasonably believed the instructions were valid.
      </p>

      <p className="contract-p">
        <strong>4.3 End-User Conduct.</strong> Client is solely responsible for:
      </p>
      <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
        <li>The actions and omissions of its users and any third parties it authorizes;</li>
        <li>Ensuring users comply with Google's acceptable use policies and applicable law;</li>
        <li>Enforcing Client's internal policies for acceptable use, security, and access.</li>
      </ul>

      <p className="contract-p">
        <strong>4.4 Compliance.</strong> Client is responsible for its own
        compliance with all applicable laws and regulations (including privacy,
        employment, and industry-specific requirements). Service Provider does
        not provide legal or regulatory compliance services unless expressly
        agreed in writing.
      </p>

      <p className="contract-p">
        <strong>4.5 Backups &amp; Retention.</strong> Client is responsible for
        determining its own requirements for data retention, archiving, and
        backups. Unless explicitly included in Schedule A, Service Provider is
        not responsible for maintaining separate backups or archives of Client
        Data.
      </p>

      <h2 className="contract-h2">FEES &amp; PAYMENT</h2>

      <p className="contract-p">
        <strong>5.1 Service Fee (Includes Up to{" "}
        {formData.includedUsers || "___"} Billable Users).</strong> In
        consideration for the Services, Client shall pay Service Provider a
        fixed monthly service fee of USD{" "}
        <input
          type="text"
          value={formData.serviceFee}
          onChange={(e) => updateField("serviceFee", e.target.value)}
          className="contract-input-inline w-[80px]"
          placeholder="120.00"
        />{" "}
        (the "Service Fee"). The Service Fee covers management of the
        Environment and includes up to{" "}
        <input
          type="number"
          value={formData.includedUsers}
          onChange={(e) => updateField("includedUsers", e.target.value)}
          className="contract-input-inline w-[70px]"
          min="0"
        />{" "}
        Billable Users in any given month. No additional per-user fees are
        charged while the Billable User Count is within that cap.
      </p>

      <p className="contract-p">
        <strong>5.2 Per-User Fees Above Included Users.</strong>
      </p>
      <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
        <li>
          If, on the User Count Date for any month, the Billable User Count
          exceeds the included users, Client shall also pay a per-user monthly
          fee of USD{" "}
          <input
            type="text"
            value={formData.perUserFee}
            onChange={(e) => updateField("perUserFee", e.target.value)}
            className="contract-input-inline w-[70px]"
            placeholder="4.00"
          />{" "}
          per Billable User for each Billable User above{" "}
          {formData.includedUsers || "___"}.
        </li>
        <li>
          Monthly Management Fee calculation:
          <div className="pl-6 mt-2">
            <div>• If Billable User Count ≤ {formData.includedUsers || "___"}: Monthly Management Fee = USD {formData.serviceFee || "______"}</div>
            <div>
              • If Billable User Count &gt; {formData.includedUsers || "___"}:
              Monthly Management Fee = USD {formData.serviceFee || "______"} + (Billable User Count −{" "}
              {formData.includedUsers || "___"}) × USD {formData.perUserFee || "____"}
            </div>
          </div>
        </li>
        <li>
          Only the Service Provider Account listed in Schedule B is not counted
          as a Billable User when determining the Billable User Count. Owner
          Account(s) are counted as Billable Users if active.
        </li>
      </ul>

      <p className="contract-p">
        <strong>5.3 User Count Determination.</strong>
      </p>
      <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
        <li>
          The Billable User Count for each month shall be determined as of{" "}
          <input
            type="text"
            value={formData.userCountDate}
            onChange={(e) => updateField("userCountDate", e.target.value)}
            className="contract-input-inline contract-input-long"
            placeholder="e.g., last calendar day of the prior month"
          />{" "}
          (the "User Count Date") using Google Workspace admin reports or
          equivalent administrative tools. Suspended user accounts may be
          counted as Billable Users if they retain active licenses.
        </li>
        <li>
          If Client does not dispute the count in writing within seven (7) days
          of receiving a summary, it is deemed accepted for billing.
        </li>
      </ul>

      <p className="contract-p">
        <strong>5.4 Invoicing &amp; Payment Terms.</strong>
      </p>
      <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
        <li>Invoiced monthly in advance.</li>
        <li>
          Payment due within{" "}
          <input
            type="number"
            value={formData.paymentDueDays}
            onChange={(e) => updateField("paymentDueDays", e.target.value)}
            className="contract-input-inline w-[70px]"
            min="0"
          />{" "}
          days.
        </li>
        <li>
          Late payments may accrue interest at{" "}
          <input
            type="text"
            value={formData.lateFeePercent}
            onChange={(e) => updateField("lateFeePercent", e.target.value)}
            className="contract-input-inline w-[70px]"
            placeholder="1.5"
          />
          % per month (or max allowed) plus collection costs.
        </li>
      </ul>

      <p className="contract-p">
        <strong>5.5 Google Fees and Other Third-Party Charges.</strong>
      </p>
      <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
        <li>
          Client is solely responsible for all Google Fees and other third-party
          fees, including any Google Workspace license used for the Service
          Provider Account.
        </li>
        <li>Management Fees do not include those charges.</li>
        <li>
          Termination/non-payment here does not relieve Client of third-party
          obligations.
        </li>
      </ul>

      <p className="contract-p">
        <strong>5.6 Taxes.</strong> Management Fees are exclusive of taxes;
        Client pays applicable taxes excluding Provider income taxes.
      </p>

      <p className="contract-p">
        <strong>5.7 Rate Adjustments.</strong> Service Provider may adjust the
        Service Fee and/or Per-User Fee at any time by providing Client with at
        least{" "}
        <input
          type="number"
          value={formData.rateChangeNoticeDays}
          onChange={(e) =>
            updateField("rateChangeNoticeDays", e.target.value)
          }
          className="contract-input-inline w-[70px]"
          min="0"
        />{" "}
        days' prior written notice. Updated rates will automatically take effect
        at the end of the notice period unless Client terminates this Agreement
        in accordance with Section 6.2. Client's continued use of the Services
        after the effective date of the revised rates constitutes acceptance of
        the new pricing.
      </p>

      <h2 className="contract-h2">TERM &amp; TERMINATION</h2>

      <p className="contract-p">
        <strong>6.1 Term.</strong> Month-to-month from Effective Date.
      </p>

      <p className="contract-p">
        <strong>6.2 Termination by Client.</strong> Client may terminate any
        time with{" "}
        <input
          type="number"
          value={formData.terminationNoticeDays}
          onChange={(e) =>
            updateField("terminationNoticeDays", e.target.value)
          }
          className="contract-input-inline w-[70px]"
          min="0"
        />{" "}
        days' notice; Client owes accrued Management Fees and all Google Fees
        unless/until cancelled with Google.
      </p>

      <p className="contract-p">
        <strong>6.3 Termination by Service Provider.</strong> Provider may
        terminate with thirty (30) days' notice without cause, or immediately
        for non-payment, material breach uncured in thirty (30) days, or
        insolvency.
      </p>

      <p className="contract-p">
        <strong>6.4 Effect of Termination.</strong> Accrued fees are due; Google
        fees continue per the Client-Google agreement; Client revokes admin
        access; optional transition help at hourly rates if requested within
        thirty (30) days.
      </p>

      <p className="contract-p">
        <strong>6.5 Survival.</strong> Key sections survive termination.
      </p>

      <h2 className="contract-h2">DATA PROTECTION &amp; SECURITY</h2>

      <p className="contract-p">
        <strong>7.1 Ownership.</strong> Client owns Client Data.
      </p>
      <p className="contract-p">
        <strong>7.2 Use.</strong> Provider accesses only as needed to perform
        Services or as required by law.
      </p>
      <p className="contract-p">
        <strong>7.3 Security.</strong> Provider uses reasonable safeguards;
        Client acknowledges data lives on Google infrastructure and Provider
        does not control Google's security or availability.
      </p>
      <p className="contract-p">
        <strong>7.4 Incidents.</strong> Provider notifies Client of confirmed
        unauthorized access through Provider systems and cooperates reasonably.
      </p>
      <p className="contract-p">
        <strong>7.5 No Guarantee of Recovery.</strong> Data recovery depends on
        Google and/or other third parties; no guarantee is provided.
      </p>
      <p className="contract-p">
        <strong>7.6 Cybersecurity Limitations and No Liability for Breaches.</strong>{" "}
        Client acknowledges and agrees that Service Provider is not a
        cybersecurity or information security professional and that the Services
        consist solely of administrative management of the Google Workspace
        Environment. Service Provider does not provide threat monitoring,
        security event analysis, incident response, penetration testing,
        vulnerability management, forensic investigation, or other specialized
        security services, and does not represent or warrant that the Environment
        or Client Data will be secure from all cyber threats, data breaches,
        account compromise, malware, phishing, or other security incidents.
        Except to the limited extent caused directly by Service Provider's gross
        negligence or willful misconduct, Client agrees that Service Provider
        shall not be held responsible or liable for any such incidents, and that
        Client remains solely responsible for implementing and maintaining
        appropriate cybersecurity measures, policies, technical controls, device
        security, and user training for its business.
      </p>

      <h2 className="contract-h2">THIRD-PARTY SERVICES &amp; GOOGLE</h2>

      <p className="contract-p">
        <strong>8.1 No Agency with Google.</strong> Provider is independent;
        Google not a party.
      </p>
      <p className="contract-p">
        <strong>8.2 Third-Party Tools.</strong> Client responsible for
        third-party agreements; Provider not liable for third-party-caused
        issues.
      </p>

      <h2 className="contract-h2">CONFIDENTIALITY</h2>

      <p className="contract-p">
        <strong>9.1 Definition.</strong> Confidential Information is non-public
        information disclosed in connection with this Agreement.
      </p>
      <p className="contract-p">
        <strong>9.2 Exclusions.</strong> Confidential Information does not
        include information that is public, previously known, lawfully received
        from a third party, or independently developed.
      </p>
      <p className="contract-p">
        <strong>9.3 Obligations.</strong> Each Party shall use Confidential
        Information only for purposes of this Agreement, protect it with
        reasonable care, and not disclose it to third parties except as
        permitted hereunder.
      </p>
      <p className="contract-p">
        <strong>9.4 Required Disclosure.</strong> Disclosure is permitted if
        legally required, provided the disclosing Party gives notice (where
        legally permitted) and cooperates reasonably with any efforts to seek
        protective treatment.
      </p>

      <h2 className="contract-h2">WARRANTIES &amp; DISCLAIMERS</h2>

      <p className="contract-p">
        <strong>10.1 Mutual Warranty.</strong> Each Party has authority to sign
        and perform under this Agreement.
      </p>
      <p className="contract-p">
        <strong>10.2 Provider Warranty.</strong> Services are performed in a
        professional and workmanlike manner.
      </p>
      <p className="contract-p">
        <strong>10.3 Disclaimer.</strong> Except as expressly stated, the
        Services are provided "as is," and all other warranties (express,
        implied, statutory, or otherwise) are disclaimed to the maximum extent
        permitted by law.
      </p>
      <p className="contract-p">
        <strong>10.4 No Guarantee.</strong> No promise of uninterrupted or
        error-free Environment or full detection/remedy of issues.
      </p>

      <h2 className="contract-h2">LIMITATION OF LIABILITY</h2>

      <p className="contract-p">
        <strong>11.1 Excluded Damages.</strong> No liability for lost profits,
        data, goodwill, interruption, or indirect, consequential, or punitive
        damages.
      </p>
      <p className="contract-p">
        <strong>11.2 Cap.</strong> Except for payment obligations, indemnity
        obligations, confidentiality breaches, or willful/illegal acts, each
        Party's total liability is capped at the Management Fees paid in the
        three (3) months before the claim event.
      </p>
      <p className="contract-p">
        <strong>11.3 Multiple Claims.</strong> Multiple claims do not enlarge
        the cap.
      </p>

      <h2 className="contract-h2">INDEMNIFICATION</h2>

      <p className="contract-p">
        <strong>12.1 Client Indemnity.</strong> Client indemnifies Provider for
        claims arising from Client/user misuse, violations of law or the Google
        Agreement, Client instructions, and Client-third party disputes.
      </p>
      <p className="contract-p">
        <strong>12.2 Provider Indemnity.</strong> Provider indemnifies Client
        only for third-party claims caused by Provider's gross negligence or
        willful misconduct.
      </p>
      <p className="contract-p">
        <strong>12.3 Conditions.</strong> Indemnification requires prompt
        notice, control of the defense by the indemnifying Party, and reasonable
        cooperation by the indemnified Party.
      </p>

      <h2 className="contract-h2">OTHER MISCELLANEOUS TERMS</h2>

      <p className="contract-p">
        <strong>13.1 Independent Contractors.</strong> No partnership, joint
        venture, or agency is created by this Agreement.
      </p>
      <p className="contract-p">
        <strong>13.2 Force Majeure.</strong> No liability for events beyond
        reasonable control; Parties shall use reasonable efforts to resume
        performance.
      </p>
      <p className="contract-p">
        <strong>13.3 Notices.</strong> Written notices by hand, courier, or
        confirmed email.
      </p>

      <h2 className="contract-h2">GOVERNING LAW AND DISPUTE RESOLUTION</h2>

      <p className="contract-p">
        <strong>14.1 Applicable Law and Jurisdiction.</strong> This Agreement
        shall be governed by and construed in accordance with the laws of the
        State of{" "}
        <input
          type="text"
          value={formData.governingState}
          onChange={(e) => updateField("governingState", e.target.value)}
          className="contract-input-inline contract-input-medium"
          placeholder="State"
        />{" "}
        without regard to its conflict of law principles. Any legal action or
        proceeding arising out of or relating to this Agreement shall be brought
        exclusively in the Superior Court of{" "}
        <input
          type="text"
          value={formData.governingCounty}
          onChange={(e) => updateField("governingCounty", e.target.value)}
          className="contract-input-inline contract-input-medium"
          placeholder="County"
        />
        , and each Party irrevocably submits to the personal and exclusive
        jurisdiction of such courts.
      </p>

      <p className="contract-p">
        <strong>14.2 Dispute Resolution Process.</strong> In the event of any
        dispute, claim, or disagreement arising out of or relating to this
        Agreement or the Services provided, the Parties agree to first attempt
        to resolve the matter through good-faith discussions. If the dispute
        cannot be resolved through direct negotiation within ten (10) calendar
        days, either Party may proceed to seek legal remedies in the designated
        court. Nothing in this section shall prevent the Service Provider from
        seeking injunctive or equitable relief in any court of competent
        jurisdiction to protect its intellectual property rights or confidential
        information.
      </p>

      <h2 className="contract-h2">MISCELLANEOUS PROVISIONS</h2>

      <p className="contract-p">
        <strong>15.1 Assignment.</strong> Neither Party may assign or transfer
        its rights or obligations under this Agreement without the prior written
        consent of the other Party, except that the Service Provider may assign
        this Agreement to an affiliate or successor entity as part of a business
        transfer or reorganization.
      </p>

      <p className="contract-p">
        <strong>15.2 Waivers and Amendments.</strong> No waiver of any term or
        condition of this Agreement shall be deemed a continuing waiver or a
        further waiver of the same or any other term. Any amendments or
        modifications must be made in writing and signed by both Parties.
      </p>

      <p className="contract-p">
        <strong>15.3 Severability.</strong> If any provision of this Agreement
        is found to be invalid or unenforceable, the remaining provisions shall
        continue in full force and effect.
      </p>

      <p className="contract-p">
        <strong>15.4 Counterparts and Electronic Signatures.</strong> This
        Agreement may be executed in counterparts, each of which shall be deemed
        an original and all of which together shall constitute one and the same
        agreement. Electronic signatures shall have the same legal effect as
        original signatures.
      </p>

      <p className="contract-p">
        <strong>15.5 Entire Agreement.</strong> This Agreement represents the
        entire understanding between the Parties with respect to the subject
        matter herein and supersedes all prior discussions, communications, or
        agreements, whether written or oral.
      </p>

      <div className="contract-section-divider">
        <h2 className="contract-h2">SCHEDULE A - SCOPE OF SERVICES</h2>
        <p className="contract-p">
          <strong>Included Services</strong>
        </p>
        <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
          <li>Creating Google Workspace user accounts on Client's written instruction;</li>
          <li>Modifying or updating Google Workspace user accounts on Client's written instruction;</li>
          <li>Suspending and/or deleting Google Workspace user accounts on Client's written instruction;</li>
          <li>Assisting users with logins and password resets via the Google Workspace Admin Console.</li>
        </ul>

        <p className="contract-p">
          <strong>Service Hours</strong>
        </p>
        <p className="contract-p">
          <input
            type="text"
            value={formData.serviceHours}
            onChange={(e) => updateField("serviceHours", e.target.value)}
            className="contract-input-inline contract-input-long"
            placeholder="standard business hours and time zone"
          />{" "}
          excluding weekends and public holidays.
        </p>

        <p className="contract-p">
          <strong>Response and Completion Targets</strong>
        </p>
        <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
          <li>
            Service Provider will begin work on each valid change request within{" "}
            <input
              type="number"
              value={formData.responseHours}
              onChange={(e) => updateField("responseHours", e.target.value)}
              className="contract-input-inline w-[70px]"
              min="1"
            />{" "}
            hours of receipt during Service Hours; and
          </li>
          <li>
            Will endeavor to complete such change within that period or notify
            Client within the same{" "}
            <span className="font-bold">{formData.responseHours}</span> hours if
            additional time, clarification, or approvals are needed.
          </li>
        </ul>

        <p className="contract-p">
          <strong>Exclusions</strong>
        </p>
        <ul className="list-disc pl-8 text-[11pt] leading-relaxed font-['Times_New_Roman',serif] mb-3">
          <li>
            Any services not expressly listed above, including but not limited
            to: device support, network support, application troubleshooting,
            security monitoring, incident response, data recovery beyond native
            Google Workspace tools, Vault/retention configuration, custom
            integrations, on-site work, and after-hours or emergency support.
          </li>
        </ul>
      </div>

      <div className="contract-section-divider">
        <h2 className="contract-h2">SCHEDULE B - FEES</h2>

        <p className="contract-p">
          <strong>Service Fee (Includes Up to{" "}
          {formData.includedUsers || "___"} Billable Users)</strong>
          <br />
          USD{" "}
          <input
            type="text"
            value={formData.serviceFee}
            onChange={(e) => updateField("serviceFee", e.target.value)}
            className="contract-input-inline w-[80px]"
            placeholder="120.00"
          />{" "}
          per month.
        </p>

        <p className="contract-p">
          <strong>Per-User Rate Above Included Billable Users</strong>
          <br />
          USD{" "}
          <input
            type="text"
            value={formData.perUserFee}
            onChange={(e) => updateField("perUserFee", e.target.value)}
            className="contract-input-inline w-[80px]"
            placeholder="4.00"
          />{" "}
          per Billable User per month above{" "}
          <input
            type="number"
            value={formData.includedUsers}
            onChange={(e) => updateField("includedUsers", e.target.value)}
            className="contract-input-inline w-[70px]"
            min="0"
          />
          .
        </p>

        <p className="contract-p">
          <strong>Service Provider Account Excluded from Billable User Count</strong>
          <br />
          <input
            type="email"
            value={formData.serviceProviderAccountEmail}
            onChange={(e) =>
              updateField("serviceProviderAccountEmail", e.target.value)
            }
            className="contract-input-inline contract-input-long"
            placeholder="admin@provider-domain.com"
          />
          <br />
          For clarity: Client remains responsible for paying Google (or its
          reseller) for all Google Workspace licenses, including the license
          associated with the Service Provider Account. The Service Provider
          Account is excluded only from the calculation of Billable Users for
          Management Fee purposes.
        </p>

        <p className="contract-p">
          <strong>Owner Account(s) (Billable if Active)</strong>
          <br />
          <textarea
            value={formData.ownerAccountEmails}
            onChange={(e) => updateField("ownerAccountEmails", e.target.value)}
            className="contract-textarea"
            placeholder="owner@client-domain.com"
          />
        </p>
      </div>

      <div className="contract-section-divider text-center" data-export-control="true">
        <h3 className="contract-h3 text-center mb-5">Download Contract</h3>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => generateDocument(formData, "pdf")}
            className="btn-primary"
          >
            📄 Download as PDF
          </button>
          <button
            onClick={() => generateDocument(formData, "doc")}
            className="btn-secondary"
          >
            📝 Download as DOC
          </button>
        </div>
      </div>
    </div>
  );
};

export const GoogleWorkspaceContract = {
  id: "google-workspace",
  name: "Google Workspace Management Agreement",
  defaultFields: {
    day: currentDate.day,
    month: currentDate.month,
    year: currentDate.year,
    serviceProviderLegalName: "",
    serviceProviderEntity: "",
    serviceProviderAddress: "",
    developerSignature: "", // Developer signature from business profile
    serviceHours: "Mon–Fri, 9:00 AM – 5:00 PM ET",
    requestChannel: "support@provider.com",
    clientLegalName: "",
    clientEntity: "",
    clientAddress: "",
    serviceFee: "120.00",
    includedUsers: "30",
    perUserFee: "4.00",
    paymentDueDays: "15",
    lateFeePercent: "1.5",
    userCountDate: "last calendar day of the prior month",
    governingState: "New Jersey",
    governingCounty: "Monmouth County",
    terminationNoticeDays: "30",
    rateChangeNoticeDays: "60",
    responseHours: "48",
    serviceProviderAccountEmail: "admin@provider-domain.com",
    ownerAccountEmails: "owner@client-domain.com",
  },
  SidebarForm: GoogleWorkspaceSidebarForm,
  Document: GoogleWorkspaceDocument,
};
