import React from "react";
import { useFormContext } from "../contexts/FormContext";
import { generateDocument } from "../utils/documentGenerator";
import { getTodayDate, formatDateToFields } from "../utils/dateUtils";
import SignatureBlock from "../components/SignatureBlock";
const currentDate = formatDateToFields(getTodayDate());

const HostingSidebarForm = ({ page = 'provider' }) => {
  const { formData, updateField } = useFormContext();

  if (page === 'provider') {
    return (
      <div>
        <h3 className="sidebar-section-title">Service Provider Information</h3>
        <div className="sidebar-section">
          <div>
            <label className="form-label">Contact Name</label>
            <input
              type="text"
              value={formData.serviceProviderName}
              onChange={(e) => updateField("serviceProviderName", e.target.value)}
              className="form-input"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="form-label">Company Name</label>
            <input
              type="text"
              value={formData.serviceProviderCompany}
              onChange={(e) =>
                updateField("serviceProviderCompany", e.target.value)
              }
              className="form-input"
              placeholder="Your Company LLC"
            />
          </div>
          <div>
            <label className="form-label">Location</label>
            <input
              type="text"
              value={formData.serviceProviderLocation}
              onChange={(e) =>
                updateField("serviceProviderLocation", e.target.value)
              }
              className="form-input"
              placeholder="123 Main St, City, State, ZIP"
            />
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
          <label className="form-label">First Name</label>
          <input
            type="text"
            value={formData.clientFirstName}
            onChange={(e) => updateField("clientFirstName", e.target.value)}
            className="form-input"
            placeholder="John"
          />
        </div>
        <div>
          <label className="form-label">Company Name</label>
          <input
            type="text"
            value={formData.clientCompanyName}
            onChange={(e) => updateField("clientCompanyName", e.target.value)}
            className="form-input"
            placeholder="Client Business Inc"
          />
        </div>
        <div>
          <label className="form-label">Address</label>
          <input
            type="text"
            value={formData.clientAddress}
            onChange={(e) => updateField("clientAddress", e.target.value)}
            className="form-input"
            placeholder="456 Business Ave, City, State, ZIP"
          />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => updateField("clientEmail", e.target.value)}
            className="form-input"
            placeholder="client@example.com"
          />
        </div>
        <div>
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => updateField("clientPhone", e.target.value)}
            className="form-input"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>
  );
};

const HostingDocument = () => {
  const { formData, updateField, signatureData, typedName, isClientView } = useFormContext();

  // Check if maintenance is included based on tier
  const includesMaintenance = formData.selectedTier && formData.selectedTier !== 'hosting-only';

  const toggleMaintenanceService = (index) => {
    const current = formData.maintenanceServices || [];
    const newServices = [...current];
    newServices[index] = !newServices[index];
    updateField("maintenanceServices", newServices);
  };

  const toggleContentUpdate = (index) => {
    const current = formData.contentUpdates || [];
    const newUpdates = [...current];
    newUpdates[index] = !newUpdates[index];
    updateField("contentUpdates", newUpdates);
  };

  // Dynamic title based on tier
  const contractTitle = includesMaintenance
    ? "WEBSITE HOSTING AND MAINTENANCE AGREEMENT"
    : "WEBSITE HOSTING AGREEMENT";

  // Section number helper - maintenance adds 2 sections (3 and 4)
  const sectionNum = (baseNum) => includesMaintenance ? baseNum : baseNum - 2;

  return (
    <div className="contract-doc">
      <h1 className="contract-h1">{contractTitle}</h1>

      <p className="contract-p">
        This {includesMaintenance ? "Website Hosting and Maintenance Agreement" : "Website Hosting Agreement"} (the "Agreement") is
        entered into as of this{" "}
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
            onChange={(e) => {
              const dateFields = formatDateToFields(e.target.value);
              updateField("day", dateFields.day);
              updateField("month", dateFields.month);
              updateField("year", dateFields.year);
            }}
            className="contract-date-picker"
          />
          )
        </span>
        <br />
        (the "Effective Date") by and between:
      </p>

      <p className="contract-p">
        <input
          type="text"
          value={formData.serviceProviderCompany}
          onChange={(e) =>
            updateField("serviceProviderCompany", e.target.value)
          }
          placeholder="Service Provider Company Name"
          className="contract-input-inline contract-input-long"
        />
        , a service provider that facilitates and manages website hosting and
        maintenance through third-party hosting platforms on behalf of its
        clients, with its principal place of business located at{" "}
        <input
          type="text"
          value={formData.serviceProviderLocation}
          onChange={(e) =>
            updateField("serviceProviderLocation", e.target.value)
          }
          placeholder="Service Provider Location"
          className="contract-input contract-input-long text-left"
        />{" "}
        (hereinafter referred to as the "Service Provider")
      </p>

      <p className="contract-p-center">-And-</p>

      <p className="contract-p">
        <input
          type="text"
          value={formData.clientFirstName}
          onChange={(e) => updateField("clientFirstName", e.target.value)}
          placeholder="Client First Name"
          className="contract-input-inline w-[150px]"
        />{" "}
        of{" "}
        <input
          type="text"
          value={formData.clientCompanyName}
          onChange={(e) => updateField("clientCompanyName", e.target.value)}
          placeholder="Client Company Name"
          className="contract-input-inline w-[250px]"
        />
        , an individual or business entity with its principal address at{" "}
        <input
          type="text"
          value={formData.clientAddress}
          onChange={(e) => updateField("clientAddress", e.target.value)}
          placeholder="Client Address"
          className="contract-input-inline contract-input-long"
        />
        , E-mail:{" "}
        <input
          type="email"
          value={formData.clientEmail}
          onChange={(e) => updateField("clientEmail", e.target.value)}
          placeholder="client@example.com"
          className="contract-input-inline w-[200px]"
        />
        , Phone Number:{" "}
        <input
          type="tel"
          value={formData.clientPhone}
          onChange={(e) => updateField("clientPhone", e.target.value)}
          placeholder="(555) 123-4567"
          className="contract-input-inline w-[150px]"
        />{" "}
        (hereinafter referred to as the "Client")
      </p>

      <p className="contract-p">
        (Together, the Service Provider and the Client may be referred to as the
        "Parties" and individually as a "Party")
      </p>

      <h2 className="contract-h2">BACKGROUND</h2>

      <p className="contract-p">
        WHEREAS, the Client desires to retain ongoing website hosting
        {includesMaintenance ? ", maintenance, and content update services" : " services"} to support the continued
        functionality and reliability of a completed website delivered by the
        Service Provider or an affiliated contractor;
      </p>

      <p className="contract-p">
        WHEREAS, the Service Provider offers managed hosting facilitation
        {includesMaintenance ? ", maintenance, and selective content update services" : ""} for static websites,
        with limited support for dynamic elements such as contact forms, media,
        and tracking scripts, all facilitated through third-party hosting
        platforms;
      </p>

      <p className="contract-p">
        WHEREAS, the Parties seek to establish clear terms that define the scope
        of services, limitations, responsibilities, and protections related to
        such hosting {includesMaintenance ? "and maintenance work" : "services"}, while preventing misunderstandings
        {includesMaintenance ? ", unplanned expansion of work, or scope creep" : ""}.
      </p>

      <p className="contract-p">
        NOW THEREFORE, in consideration of the mutual promises and covenants set
        forth herein, and intending to be legally bound, the Parties agree to
        the terms and conditions stated in this Agreement.
      </p>

      <h2 className="contract-h2">1. DEFINITIONS</h2>

      <p className="contract-p">
        <strong>"Static Website"</strong> means a website that primarily
        consists of fixed content and files, without server-side processing or
        real-time interactions, typically suitable for informational purposes
        without requiring dynamic integrations.
      </p>

      <p className="contract-p">
        <strong>"Dynamic Functionality"</strong> means any feature of a website
        that involves user interaction, server-side scripting, external
        application integration, databases, or other components that generate
        content or behavior based on user input or system activity.
      </p>

      <p className="contract-p">
        <strong>"Hosting Platform"</strong> means the third-party service
        selected by the Service Provider to store, serve, and deliver the
        website files to users via the internet, including any associated
        infrastructure and tools.
      </p>

      <p className="contract-p">
        <strong>"Maintenance"</strong> means routine tasks performed by the
        Service Provider to ensure the hosted website remains functional,
        updated, and free from technical errors, including content corrections,
        form testing, minor visual adjustments, and monthly software/package
        updates applicable to the static site stack.
      </p>

      <p className="contract-p">
        <strong>"Content Update"</strong> means any modification made to
        existing text, images, videos, metadata, or tags within the website's
        current structure, as requested by the Client and falling within the
        limitations defined in this Agreement.
      </p>

      <p className="contract-p">
        <strong>"Scope Creep"</strong> means the unauthorized or unintended
        expansion of work or services beyond the limits agreed upon in this
        Agreement, including but not limited to requests for new pages, major
        design changes, or unplanned features.
      </p>

      <p className="contract-p">
        <strong>"Structural Change"</strong> means any modification that alters
        the layout, navigation, functionality, or framework of the website,
        including the creation of new pages, sections, or integrated features
        beyond simple content updates.
      </p>

      <p className="contract-p">
        <strong>"Form Submission Management"</strong> means the monitoring and
        validation of contact form functionality, ensuring that submissions are
        correctly processed and delivered through a designated form-handling
        service.
      </p>

      <p className="contract-p">
        <strong>"Maintenance Request"</strong> means a written communication
        submitted by the Client using the format set out in Exhibit B,
        specifying the updates or adjustments requested under the scope of
        Maintenance or Content Update.
      </p>

      <p className="contract-p">
        <strong>"Third-Party Terms"</strong> means the legal policies, service
        terms, and limitations imposed by any external service provider used in
        the delivery of hosting or related tools, including those of the Hosting
        Platform and any form-processing service.
      </p>

      <h2 className="contract-h2">2. SCOPE OF HOSTING SERVICES</h2>

      <p className="contract-p">
        <strong>2.1 Managed Hosting Facilitation.</strong> The Service Provider
        shall facilitate and manage the hosting of the Client's Static Website
        using a Hosting Platform selected at the sole discretion of the Service
        Provider. Hosting services shall include the setup, configuration, and
        deployment of website files to the designated Hosting Platform, ensuring
        the website is publicly accessible via the internet for the duration of
        this Agreement. The Service Provider shall monitor basic website
        performance, including uptime visibility and general accessibility, and
        shall address minor technical issues as they arise through reasonable
        efforts.
      </p>

      <p className="contract-p">
        <strong>2.2 Hosting Platform Responsibility.</strong> The scope of
        hosting is limited to Static Websites, and does not include Dynamic
        Functionality unless expressly agreed in writing under a separate
        agreement. The Service Provider shall also ensure that the website's
        contact form remains operational through Form Submission Management
        using third-party tools, provided the form setup remains unchanged.
        Hosting is provided on a managed basis, and the Service Provider is not
        responsible for the infrastructure, availability guarantees, or policies
        of the Hosting Platform itself. All Hosting Services are subject to
        applicable Third-Party Terms.
      </p>

      <p className="contract-p">
        <strong>2.3 Exclusions.</strong> No analytics/tracking implementation
        beyond basic tag insertion, no SEO services beyond basic metadata
        updates, and no standalone security monitoring or incident response are
        included beyond what the Hosting Platform natively provides, unless
        separately agreed in writing.
      </p>

      {/* Section 3: Only show for maintenance tiers */}
      {includesMaintenance && (
        <>
          <h2 className="contract-h2">
            3. SCOPE OF MAINTENANCE AND CONTENT UPDATES
          </h2>

          <p className="contract-p">
            <strong>3.1 Included Services.</strong> The Service Provider shall
            provide ongoing Maintenance and limited Content Updates for the hosted
            website during the term of this Agreement. Valid Content Updates include
            changes to text, images, videos, metadata, or tracking tags within the
            website's existing layout and structure. The Client may also request
            updates such as adding a new service area, replacing a photo or video,
            or inserting standard analytics or advertising tags, provided these
            updates remain consistent with the website's current content types and
            format.
          </p>

          <p className="contract-p">
            <strong>3.2 Monthly Software/Package Updates.</strong> The Service
            Provider will apply routine updates for the static site's build tooling
            or package dependencies (as applicable to a static site) under the
            Service Provider's control, excluding any redesign, code refactor,
            feature addition beyond maintenance scope.
          </p>

          <p className="contract-p">
            <strong>3.3 Structural Change Exclusions.</strong> All updates must fit
            within the framework of the originally designed website and shall not
            involve any Structural Changes. Specifically, the creation of new pages,
            redesign of existing layouts, integration of third-party applications,
            or expansion of site functionality shall not be included in Maintenance
            or Content Updates. Such requests fall outside the agreed scope and
            shall require a separate written agreement before any work is initiated.
          </p>

          <p className="contract-p">
            <strong>3.4 Request Process.</strong> Requests for Maintenance or
            Content Updates must be submitted using the Maintenance Request format
            set out in Exhibit B and will be handled at the Service Provider's
            discretion, based on reasonableness and workload.
          </p>

          <p className="contract-p">
            <strong>3.5 Emergency Measures & Pass-Through Costs.</strong> In the
            event of abusive traffic (including DDoS), Service Provider may, at its
            discretion, implement emergency measures (e.g., enable CDN/WAF,
            temporarily restrict traffic, or place the site in maintenance mode).
            Any third-party fees, usage surcharges, or configuration costs incurred
            will be passed through to Client upon invoice. Service Provider is not
            liable for availability impacts resulting from such events or measures.
          </p>

          <h2 className="contract-h2">
            4. LIMITATIONS ON SERVICES / SCOPE CREEP DISCLAIMER
          </h2>

          <p className="contract-p">
            The Parties expressly acknowledge that the services covered under this
            Agreement are limited in nature and scope. Any requests involving new
            sections, full-page additions, advanced integrations, or any form of
            redesign or re-architecture of the website shall be considered
            Structural Changes and are not included in the services defined herein.
            The Service Provider shall not be obligated to perform such work unless
            the Parties enter into a separate written agreement outlining the new
            scope, timeline, and applicable fees.
          </p>

          <p className="contract-p">
            Examples of permitted changes under this Agreement include updating
            existing service areas, replacing or adding photos or videos, revising
            written content, or inserting tracking or analytics tags within existing
            pages. Examples of excluded changes include adding new pages, changing
            navigation menus, building interactive elements, integrating third-party
            platforms, or altering the overall layout or structure of the site.
          </p>

          <p className="contract-p">
            This provision is expressly intended to prevent Scope Creep and to
            preserve the clarity, enforceability, and contractual integrity of the
            agreed-upon deliverables. The Service Provider reserves the exclusive
            right, in its sole discretion, to decline, postpone, or condition the
            acceptance of any requests that exceed the scope of services defined in
            this Agreement, unless and until such services are separately negotiated
            and memorialized in a written agreement signed by both Parties.
          </p>
        </>
      )}

      <h2 className="contract-h2">{sectionNum(5)}. FORM MANAGEMENT AND MONITORING</h2>

      <p className="contract-p">
        <strong>{sectionNum(5)}.1 Third-Party Processor.</strong> {includesMaintenance
          ? "As part of the ongoing Maintenance services, the Service Provider shall be responsible for monitoring the functionality of the website's contact form and ensuring that form submissions are processed and delivered as intended."
          : "The Service Provider shall monitor the functionality of the website's contact form and ensure that form submissions are processed and delivered as intended."} This
        includes routine testing of form delivery through the designated
        form-handling tool and addressing minor issues that may interfere with
        proper operation, provided the form configuration remains unchanged.
      </p>

      <p className="contract-p">
        <strong>{sectionNum(5)}.2 Limitations.</strong> The Service Provider facilitates Form
        Submission Management through a third-party service, such as Formspree
        or its equivalent, and makes no representation or warranty regarding the
        reliability, uptime, or data processing practices of such external
        providers. All form-related services are subject to the applicable
        Third-Party Terms, and the Service Provider disclaims all liability
        arising from interruptions, delays, errors, or data loss attributable to
        the third-party form service.
      </p>

      <h2 className="contract-h2">{sectionNum(6)}. CLIENT RESPONSIBILITIES</h2>

      <p className="contract-p">
        The Client agrees to fulfill the following responsibilities to enable
        effective delivery of the services described in this Agreement:
      </p>

      <p className="contract-p">
        <strong>Timely Content Provision:</strong> The Client shall provide all
        required content materials, including text, images, videos, and other
        media in a timely and complete manner and in the format reasonably
        requested by the Service Provider.
      </p>

      <p className="contract-p">
        <strong>Review and Approvals:</strong> The Client shall review and
        respond to all updates, maintenance work, and other deliverables
        promptly and shall provide clear written approval or feedback within a
        reasonable timeframe.
      </p>

      <p className="contract-p">
        <strong>Issue Reporting:</strong> The Client shall notify the Service
        Provider in writing of any known technical issues, functional errors, or
        website malfunctions as soon as they are discovered.
      </p>

      <p className="contract-p">
        <strong>Third Party Access Credentials:</strong> Where necessary, the
        Client shall provide access credentials or relevant authorization for
        third-party accounts or tools used in connection with the hosted
        website, such as domain registrars, analytics services, or form
        handlers.
      </p>

      <p className="contract-p">
        <strong>Ongoing Cooperation:</strong> The Client agrees to maintain
        responsive communication with the Service Provider throughout the
        duration of this Agreement and to cooperate reasonably in all matters
        relating to the services provided.
      </p>

      <p className="contract-p">
        <strong>Retention of Backup Copies:</strong> The Client shall be solely
        responsible for maintaining backup copies of all content and data
        provided to the Service Provider, unless separately agreed in writing.
      </p>

      <p className="contract-p">
        <strong>Designated Point of Contact:</strong> The Client shall designate
        a single point of contact for all communications relating to the
        services under this Agreement in order to avoid miscommunication or
        conflicting instructions.
      </p>

      <h2 className="contract-h2">{sectionNum(7)}. FEES AND PAYMENT TERMS</h2>

      <p className="contract-p">
        The Client agrees to pay the Service Provider the applicable fees for
        hosting and maintenance services as outlined in Exhibit A, which may be
        charged on a monthly or annual basis, depending on the selected plan.
        All fees are due in advance of the service period and are nonrefundable
        once the billing cycle has commenced unless expressly stated otherwise
        in this Agreement.
      </p>

      <p className="contract-p">
        Invoices shall be issued electronically, and payments shall be made
        through the method specified by the Service Provider. The Service
        Provider reserves the right to suspend services, including access to the
        hosted website, if payment is not received within five calendar days
        following the due date stated on the invoice.
      </p>

      <p className="contract-p">
        Any late payment shall be subject to a late fee of five percent of the
        outstanding balance per thirty-day period or the maximum permitted by
        law, whichever is lower. Continued nonpayment exceeding thirty calendar
        days may result in the permanent suspension of hosting services and
        removal of the website from the Hosting Platform.
      </p>

      <p className="contract-p">
        The Service Provider shall not be obligated to commence or continue any
        service unless all outstanding fees are paid in full. The Client shall
        also be responsible for any third-party transaction or processing fees
        incurred during payment.
      </p>

      <h2 className="contract-h2">{sectionNum(8)}. TERM AND TERMINATION</h2>

      <p className="contract-p">
        This Agreement shall commence on the Effective Date and shall remain in
        effect on a rolling monthly or annual basis, depending on the hosting
        plan selected by the Client, as specified in Exhibit A, unless
        terminated in accordance with this section.
      </p>

      <p className="contract-p">
        The Agreement shall automatically renew at the end of each billing cycle
        unless the Client provides written notice of nonrenewal at least ten
        calendar days prior to the renewal date. The Service Provider may also
        decline renewal by giving similar written notice within the same
        timeframe.
      </p>

      <p className="contract-p">
        Either Party may terminate this Agreement at any time by providing at
        least ten calendar days' written notice to the other Party. The Service
        Provider may suspend or terminate services immediately if the Client
        materially breaches the terms of this Agreement, including failure to
        pay fees, misuse of the hosting services, or repeated interference with
        the scope of agreed deliverables.
      </p>

      <p className="contract-p">
        Upon termination, the Service Provider shall retain the hosted website
        files and related data for up to seven calendar days unless instructed
        otherwise in writing. After this period, all website files and data
        under the Service Provider's control may be permanently deleted without
        further notice. The Client is solely responsible for downloading or
        transferring any content or data prior to deletion.
      </p>

      <p className="contract-p">
        No refunds shall be issued for any unused portion of the hosting term
        unless otherwise agreed in writing.
      </p>

      <h2 className="contract-h2">{sectionNum(9)}. DATA SECURITY AND PRIVACY COMPLIANCE</h2>

      <p className="contract-p">
        The Service Provider shall take reasonable measures to ensure that form
        submissions processed through the website's designated form tool are
        correctly routed to the Client's chosen email address or destination.
        However, the Service Provider does not access, store, or manage form
        data beyond basic form functionality testing and shall not be held
        liable for the content, accuracy, or legal compliance of any data
        collected through the website.
      </p>

      <p className="contract-p">
        The Client acknowledges that they are the data controller for all
        information submitted through the website's forms and shall remain
        solely responsible for ensuring compliance with applicable data
        protection laws, including but not limited to laws governing consent,
        data retention, and user notification requirements.
      </p>

      <p className="contract-p">
        All form submissions shall be handled using a third-party form processor
        selected by the Service Provider or the Client, and such data shall be
        subject to the privacy practices and legal terms of that provider. The
        Service Provider makes no warranties or representations regarding the
        data handling practices, availability, or compliance posture of such
        third-party services and disclaims all responsibility for any resulting
        data breaches, delivery failures, or compliance violations beyond its
        direct control.
      </p>

      <h2 className="contract-h2">{sectionNum(10)}. INTELLECTUAL PROPERTY RIGHTS</h2>

      <p className="contract-p">
        The Client shall retain full ownership of all original content,
        including text, images, videos, logos, and other proprietary materials
        provided by the Client for use on the hosted website. This ownership
        extends to any edits or updates made to such content during the course
        of the hosting and maintenance services.
      </p>

      <p className="contract-p">
        The Service Provider shall retain all rights, title, and interest in and
        to any tools, systems, scripts, configurations, or custom settings used
        to deploy, maintain, or support the website through the Hosting
        Platform. This includes, without limitation, any server-side
        configurations, deployment scripts, automation tools, or other
        infrastructure components developed or maintained by the Service
        Provider in the course of fulfilling this Agreement.
      </p>

      <p className="contract-p">
        Nothing in this Agreement shall be interpreted as granting the Client
        any rights to the Service Provider's proprietary systems, workflows, or
        hosting framework, except as necessary for the Client's use and display
        of the website during the term of this Agreement.
      </p>

      <h2 className="contract-h2">{sectionNum(11)}. WARRANTIES AND DISCLAIMERS</h2>

      <p className="contract-p">
        The Client acknowledges and agrees that the services provided under this
        Agreement are subject to reasonable technical and operational
        limitations. Accordingly, the following warranties and disclaimers shall
        apply:
      </p>

      <p className="contract-p">
        The Service Provider shall make commercially reasonable efforts to
        ensure that the hosted website remains accessible and functional during
        the term of this Agreement.
      </p>

      <p className="contract-p">
        The Service Provider does not warrant uninterrupted access or continuous
        uptime of the website. Service interruptions may occur due to
        maintenance, hosting provider outages, or circumstances beyond the
        Service Provider's control.
      </p>

      <p className="contract-p">
        The Service Provider does not guarantee full compliance with
        accessibility laws, privacy regulations, or any industry-specific
        requirements unless such compliance has been expressly agreed upon in a
        separate written agreement. Any basic accessibility or compliance
        support provided shall be limited to reasonable efforts and shall not
        constitute a legal warranty or certification.
      </p>

      <p className="contract-p">
        The Service Provider does not provide advanced analytics/tracking
        management, comprehensive SEO services, or security monitoring beyond
        what the Hosting Platform natively provides, unless expressly agreed in
        a separate written agreement.
      </p>

      <p className="contract-p">
        All services are provided on an "as-is" and "as-available" basis. The
        Service Provider disclaims all other warranties, whether express or
        implied, including but not limited to any warranties of merchantability,
        fitness for a particular purpose, or noninfringement.
      </p>

      <h2 className="contract-h2">{sectionNum(12)}. LIMITATION OF LIABILITY</h2>

      <p className="contract-p">
        To the fullest extent permitted by applicable law, the total cumulative
        liability of the Service Provider for any claims, losses, damages, or
        causes of action arising out of or related to this Agreement, whether in
        contract, tort, or otherwise, shall be strictly limited to the total
        amount of fees actually paid by the Client to the Service Provider under
        this Agreement in the three calendar months immediately preceding the
        event giving rise to the claim.
      </p>

      <p className="contract-p">
        In no event shall the Service Provider be liable for any indirect,
        incidental, special, consequential, or exemplary damages, including but
        not limited to loss of profits, business interruption, loss of data, or
        reputational harm, even if advised of the possibility of such damages.
      </p>

      <p className="contract-p">
        The Client acknowledges that this limitation of liability is a material
        part of the consideration exchanged under this Agreement and forms an
        essential basis of the bargain between the Parties.
      </p>

      <h2 className="contract-h2">{sectionNum(13)}. INDEMNIFICATION</h2>

      <p className="contract-p">
        The Client agrees to indemnify, defend, and hold harmless the Service
        Provider, along with its affiliates, contractors, and representatives,
        from and against any and all claims, liabilities, damages, losses,
        costs, and expenses, including reasonable legal fees, arising out of or
        in connection with the Client's use or misuse of the hosting services or
        any breach of this Agreement.
      </p>

      <p className="contract-p">
        This indemnity includes, but is not limited to, claims resulting from
        any content, data, or materials provided by the Client that infringe
        upon the intellectual property rights, privacy rights, or other legal
        rights of any third party. It also covers any claims or investigations
        arising from the Client's failure to comply with applicable laws,
        regulations, or third-party platform requirements related to
        advertising, data privacy, accessibility, or consumer protection.
      </p>

      <p className="contract-p">
        In addition, the Client shall indemnify the Service Provider against any
        third-party disputes or claims arising from the content, functionality,
        or usage of the hosted website, including but not limited to form data
        collection, misleading statements, or operational failures under the
        Client's direction.
      </p>

      <p className="contract-p">
        This indemnification obligation shall survive the termination or
        expiration of this Agreement and shall remain enforceable for any events
        occurring during the term of service.
      </p>

      <h2 className="contract-h2">{sectionNum(14)}. CONFIDENTIALITY</h2>

      <p className="contract-p">
        The Service Provider agrees to maintain the confidentiality of all
        non-public information, materials, and credentials shared by the Client
        in connection with the hosting services. This includes but is not
        limited to website login credentials, administrative access, proprietary
        content, business strategies, unpublished media, and any other
        information marked or reasonably understood to be confidential in
        nature.
      </p>

      <p className="contract-p">
        Such information shall be used solely for the purpose of delivering the
        services outlined in this Agreement and shall not be disclosed to any
        third party without the Client's prior written consent, except as
        required by law or by order of a competent authority.
      </p>

      <p className="contract-p">
        The Service Provider shall take reasonable administrative, technical,
        and physical precautions to safeguard confidential information against
        unauthorized use, access, or disclosure. However, the Service Provider
        shall not be held liable for any breach resulting from causes beyond its
        reasonable control, including breaches affecting third-party tools,
        servers, or communication platforms not operated by the Service
        Provider.
      </p>

      <p className="contract-p">
        This confidentiality obligation shall survive the termination of this
        Agreement and remain in effect for a period of two years following the
        completion of services.
      </p>

      <h2 className="contract-h2">{sectionNum(15)}. FORCE MAJEURE</h2>

      <p className="contract-p">
        The Service Provider shall not be held liable for any delay or failure
        in performance, including downtime, interruptions, or loss of data,
        resulting from causes beyond its reasonable control. These causes may
        include, but are not limited to, natural disasters, acts of war or
        terrorism, civil disturbances, labor disputes, government restrictions,
        utility outages, failures of internet service providers, third-party
        hosting or form processing outages, or any other events commonly
        classified as force majeure.
      </p>

      <p className="contract-p">
        Such events shall not constitute a breach of this Agreement, and the
        affected Party shall be excused from performance for the duration of the
        event and a reasonable recovery period thereafter. The Service Provider
        shall make commercially reasonable efforts to resume services as soon as
        practicable following any such disruption.
      </p>

      <h2 className="contract-h2">{sectionNum(16)}. NOTICES</h2>

      <p className="contract-p">
        All notices, requests, consents, and other communications required or
        permitted under this Agreement shall be in writing and shall be deemed
        properly given when delivered in person, sent by certified mail with
        return receipt requested, or sent via electronic mail with delivery
        confirmation to the addresses provided above or such other address as
        either Party may designate by written notice.
      </p>

      <p className="contract-p">
        Notices delivered in person shall be effective immediately upon
        delivery. Notices sent by certified mail shall be effective three
        business days after mailing. Notices sent by electronic mail shall be
        effective upon confirmation of successful transmission.
      </p>

      <p className="contract-p">
        Each Party agrees to keep its contact information current and to
        promptly notify the other Party of any changes.
      </p>

      <h2 className="contract-h2">{sectionNum(17)}. CYBERSECURITY DISCLAIMER</h2>

      <p className="contract-p">
        The Service Provider is not a cybersecurity expert and does not offer
        professional security advice or services. However, the Service Provider{" "}
        <strong>
          may implement basic security-related configurations or precautions
        </strong>{" "}
        that it believes are appropriate for the nature of the services
        provided, particularly in connection with static websites hosted through
        third-party platforms. These optional actions are taken at the sole
        discretion of the Service Provider and are not intended to serve as
        comprehensive protection against cyber threats.
      </p>

      <p className="contract-p">
        The Client understands and accepts that{" "}
        <strong>
          all websites and online systems are inherently vulnerable to
          cybersecurity risks
        </strong>
        , and that no guarantee can be made regarding complete protection from
        unauthorized access, malicious activity, data loss, service disruption,
        or other security-related incidents.
      </p>

      <p className="contract-p">
        The Service Provider does not monitor for, detect, or respond to
        cybersecurity threats beyond the standard capabilities provided by the
        selected third-party hosting or form processing platforms. Furthermore,
        the Service Provider does not warrant or assume responsibility for the
        security of third-party systems, including but not limited to hosting
        providers, domain registrars, analytics tools, or contact form services.
      </p>

      <p className="contract-p">
        To the fullest extent permitted by law,{" "}
        <strong>
          the Service Provider disclaims all liability for any losses, damages,
          claims, or disruptions resulting from cybersecurity incidents
        </strong>
        , unless such incidents result directly from the Service Provider's
        intentional misconduct.
      </p>

      <h2 className="contract-h2">{sectionNum(18)}. GOVERNING LAW AND DISPUTE RESOLUTION</h2>

      <p className="contract-p">
        This Agreement shall be governed by and construed in accordance with the
        laws of the State of New Jersey, without regard to its conflict of law
        principles. Any legal action or proceeding arising out of or relating to
        this Agreement shall be brought exclusively in the Superior Court of
        Monmouth County, New Jersey, and each party irrevocably submits to the
        personal and exclusive jurisdiction of such courts.
      </p>

      <p className="contract-p">
        In the event of any dispute, claim, or disagreement arising out of or
        relating to this Agreement or the services provided, the parties agree
        to first attempt to resolve the matter through good-faith discussions.
        If the dispute cannot be resolved through direct negotiation within ten
        calendar days, either party may proceed to seek legal remedies in the
        designated court. Nothing in this section shall prevent the Service
        Provider from seeking injunctive or equitable relief in any court of
        competent jurisdiction to protect its intellectual property rights or
        confidential information.
      </p>

      <h2 className="contract-h2">{sectionNum(19)}. MISCELLANEOUS PROVISIONS</h2>

      <p className="contract-p">
        Neither Party may assign or transfer its rights or obligations under
        this Agreement without the prior written consent of the other Party,
        except that the Service Provider may assign this Agreement to an
        affiliate or successor entity as part of a business transfer or
        reorganization.
      </p>

      <p className="contract-p">
        No waiver of any term or condition of this Agreement shall be deemed a
        continuing waiver or a further waiver of the same or any other term. Any
        amendments or modifications must be made in writing and signed by both
        Parties.
      </p>

      <p className="contract-p">
        If any provision of this Agreement is found to be invalid or
        unenforceable, the remaining provisions shall continue in full force and
        effect.
      </p>

      <p className="contract-p">
        This Agreement may be executed in counterparts, each of which shall be
        deemed an original and all of which together shall constitute one and
        the same agreement. Electronic signatures shall have the same legal
        effect as original signatures.
      </p>

      <p className="contract-p">
        This Agreement represents the entire understanding between the Parties
        with respect to the subject matter herein and supersedes all prior
        discussions, communications, or agreements, whether written or oral.
      </p>

      {/* EXHIBIT A */}
      <div className="contract-section-divider">
        <h2 className="contract-h2 text-center text-[14pt]">
          EXHIBIT A - SCOPE OF HOSTING {includesMaintenance ? "AND MAINTENANCE" : "SERVICES"}
        </h2>

        <p className="contract-p">
          This Exhibit outlines the specific hosting {includesMaintenance ? "and maintenance " : ""}services to
          be provided by the Service Provider under the Agreement. All services
          are limited to the scope described below. Any additional work or
          service beyond this Exhibit shall require a separate written
          agreement.
        </p>

        <h3 className="contract-h3">Website Type and Hosting Environment</h3>

        <p className="contract-p">
          The Client's website will be hosted and maintained as described below,
          based on the selected configuration and service level.
        </p>

        <div className="flex flex-col ml-6 mb-4">
          <label className="contract-checkbox-label">
            <input
              type="radio"
              checked={formData.websiteType === "static"}
              onChange={() => updateField("websiteType", "static")}
              className="contract-checkbox"
            />
            <span>Static Website (default)</span>
          </label>
          <label className="contract-checkbox-label">
            <input
              type="radio"
              checked={formData.websiteType === "dynamic"}
              onChange={() => updateField("websiteType", "dynamic")}
              className="contract-checkbox"
            />
            <span>Static Website with Minor Dynamic Features</span>
          </label>
          {formData.websiteType === "dynamic" && (
            <div className="ml-7 mt-2">
              <span>(specify): </span>
              <input
                type="text"
                value={formData.dynamicFeatures}
                onChange={(e) => updateField("dynamicFeatures", e.target.value)}
                placeholder="e.g., contact form, basic animations"
                className="contract-input contract-input-long text-left"
              />
            </div>
          )}
        </div>

        <p className="contract-p">
          Hosting will be managed by the Service Provider using a selected
          third-party hosting platform. Hosting includes deployment, uptime
          monitoring, and server configuration. The Service Provider will
          coordinate any required account setup unless otherwise agreed.
        </p>

        {/* Maintenance Services - only for maintenance tiers */}
        {includesMaintenance && (
          <>
            <h3 className="contract-h3">Maintenance Services</h3>
            <p className="contract-p">
              The following maintenance services are included:
            </p>

            <div className="flex flex-col ml-6 mb-4">
              {[
                "Periodic testing of website uptime and form functionality",
                "Minor updates to existing content areas (e.g., text, images, video replacements)",
                "Addition of SEO tracking tags or metadata",
                "Domain and SSL monitoring (if applicable)",
                "Troubleshooting broken links or display issues",
                "Monthly software/package updates applicable to the static site stack",
              ].map((service, index) => (
                <label key={index} className="contract-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.maintenanceServices?.[index] || false}
                    onChange={() => toggleMaintenanceService(index)}
                    className="contract-checkbox"
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>

            <h3 className="contract-h3">Content Updates</h3>
            <p className="contract-p">
              Permitted updates under this Agreement include only the following:
            </p>

            <div className="flex flex-col ml-6 mb-4">
              {[
                "Swapping or editing existing images and video",
                "Editing or replacing existing text",
                "Adding new content of the same type or layout (e.g., new city in a list of cities served)",
                "Replacing contact information or business details",
                "Adding embedded links or external resources",
              ].map((update, index) => (
                <label key={index} className="contract-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.contentUpdates?.[index] || false}
                    onChange={() => toggleContentUpdate(index)}
                    className="contract-checkbox"
                  />
                  <span>{update}</span>
                </label>
              ))}
            </div>
          </>
        )}

        <h3 className="contract-h3">Excluded Services</h3>
        <p className="contract-p">
          The following items are not included and will require a separate
          agreement:
        </p>
        <div className="ml-6 mb-4">
          <p className="my-1">✘ New web pages</p>
          <p className="my-1">✘ Structural layout changes</p>
          <p className="my-1">✘ Custom integrations or third-party apps</p>
          <p className="my-1">✘ Complete redesign or rebranding</p>
          <p className="my-1">✘ Copywriting for new sections</p>
          <p className="my-1">✘ ADA accessibility audits or certifications</p>
          <p className="my-1">✘ Legal or compliance consulting</p>
          <p className="my-1">
            ✘ Advanced analytics management or SEO campaigns
          </p>
          <p className="my-1">
            ✘ Security monitoring beyond hosting platform defaults
          </p>
        </div>

        <h3 className="contract-h3">Form Management</h3>

        <div className="flex flex-col ml-6 mb-4">
          <label className="contract-checkbox-label">
            <input
              type="checkbox"
              checked={formData.formMonitoring || false}
              onChange={(e) => updateField("formMonitoring", e.target.checked)}
              className="contract-checkbox"
            />
            <span>
              Form monitoring and delivery testing (using Formspree or
              equivalent)
            </span>
          </label>

          <p className="mt-3 mb-2">Formspree account managed by:</p>
          <div className="flex flex-col ml-6">
            <label className="contract-checkbox-label">
              <input
                type="radio"
                checked={formData.formspreeManagement === "service-provider"}
                onChange={() =>
                  updateField("formspreeManagement", "service-provider")
                }
                className="contract-checkbox"
              />
              <span>Service Provider</span>
            </label>
            <label className="contract-checkbox-label">
              <input
                type="radio"
                checked={formData.formspreeManagement === "client"}
                onChange={() => updateField("formspreeManagement", "client")}
                className="contract-checkbox"
              />
              <span>Client</span>
            </label>
            <label className="contract-checkbox-label">
              <input
                type="radio"
                checked={formData.formspreeManagement === "joint"}
                onChange={() => updateField("formspreeManagement", "joint")}
                className="contract-checkbox"
              />
              <span>Joint access</span>
            </label>
          </div>
        </div>

        <p className="contract-p">
          <strong>Service Start Date:</strong>{" "}
          <input
            type="date"
            value={formData.serviceStartDate}
            onChange={(e) => updateField("serviceStartDate", e.target.value)}
            className="contract-input w-[140px]"
          />
        </p>

        <p className="contract-p">
          <strong>Billing Period:</strong>
        </p>
        <div className="flex flex-col ml-6 mb-4">
          <label className="contract-checkbox-label">
            <input
              type="radio"
              checked={formData.billingPeriod === "monthly"}
              onChange={() => updateField("billingPeriod", "monthly")}
              className="contract-checkbox"
            />
            <span>Monthly</span>
          </label>
          <label className="contract-checkbox-label">
            <input
              type="radio"
              checked={formData.billingPeriod === "annually"}
              onChange={() => updateField("billingPeriod", "annually")}
              className="contract-checkbox"
            />
            <span>Annually</span>
          </label>
        </div>

        <p className="contract-p">
          <strong>Additional Notes or Customizations:</strong>
        </p>
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => updateField("additionalNotes", e.target.value)}
          placeholder="Enter any additional notes..."
          className="contract-textarea ml-6 mb-4"
        />

        <h3 className="contract-h3">Fees and Payment Terms</h3>

        <p className="contract-p">
          The Client agrees to pay the Service Provider the following fee for
          hosting {includesMaintenance ? "and maintenance " : ""}services:
        </p>

        {/* Show tier-based pricing when tier is selected (client view) */}
        {formData.selectedTier ? (
          <div className="ml-6 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="contract-p mb-2">
              <strong>Selected Plan:</strong>{" "}
              {formData.selectedTier === 'hosting-only' && 'Hosting Only'}
              {formData.selectedTier === 'hosting-basic' && 'Hosting + Maintenance Basic (3 content updates/week)'}
              {formData.selectedTier === 'hosting-priority' && 'Hosting + Maintenance Priority (15 content updates/week)'}
            </p>
            <p className="contract-p text-lg font-semibold">
              <strong>Monthly Fee:</strong>{" "}
              {formData.selectedTier === 'hosting-only' && '$50.00/month'}
              {formData.selectedTier === 'hosting-basic' && '$80.00/month'}
              {formData.selectedTier === 'hosting-priority' && '$100.00/month'}
            </p>
          </div>
        ) : (
          /* Admin view - allow manual fee entry or show tier options */
          <>
            <div className="ml-6 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                <strong>Standard Tier Pricing (client will select):</strong>
              </p>
              <ul className="text-sm text-gray-700 space-y-1 mb-3">
                <li>• <strong>Hosting Only:</strong> $50/month</li>
                <li>• <strong>Basic Maintenance:</strong> $80/month (3 content updates/week)</li>
                <li>• <strong>Priority Maintenance:</strong> $100/month (15 content updates/week)</li>
              </ul>
              <p className="text-xs text-gray-500 italic">
                The client will choose their plan when signing the contract.
              </p>
            </div>

            <p className="contract-p">
              <strong>Or set a custom fee:</strong> $
              <input
                type="number"
                step="0.01"
                value={formData.totalFee}
                onChange={(e) => updateField("totalFee", e.target.value)}
                placeholder="0.00"
                className="contract-input w-[80px]"
              />{" "}
              per
            </p>

            <div className="flex flex-col ml-6 mb-4">
              <label className="contract-checkbox-label">
                <input
                  type="radio"
                  checked={formData.feeFrequency === "month"}
                  onChange={() => updateField("feeFrequency", "month")}
                  className="contract-checkbox"
                />
                <span>month</span>
              </label>
              <label className="contract-checkbox-label">
                <input
                  type="radio"
                  checked={formData.feeFrequency === "year"}
                  onChange={() => updateField("feeFrequency", "year")}
                  className="contract-checkbox"
                />
                <span>year</span>
              </label>
            </div>
          </>
        )}

        <p className="contract-p">
          <strong>Invoicing Method:</strong>
        </p>
        <div className="flex flex-col ml-6 mb-4">
          <label className="contract-checkbox-label">
            <input
              type="radio"
              checked={formData.invoicingMethod === "upfront"}
              onChange={() => updateField("invoicingMethod", "upfront")}
              className="contract-checkbox"
            />
            <span>Paid upfront on or before the service start date</span>
          </label>
          <label className="contract-checkbox-label">
            <input
              type="radio"
              checked={formData.invoicingMethod === "recurring"}
              onChange={() => updateField("invoicingMethod", "recurring")}
              className="contract-checkbox"
            />
            <span>Recurring automatic payments</span>
          </label>
          <label className="contract-checkbox-label">
            <input
              type="radio"
              checked={formData.invoicingMethod === "other"}
              onChange={() => updateField("invoicingMethod", "other")}
              className="contract-checkbox"
            />
            <span>Other: </span>
            {formData.invoicingMethod === "other" && (
              <input
                type="text"
                value={formData.invoicingOther}
                onChange={(e) => updateField("invoicingOther", e.target.value)}
                placeholder="Specify method"
                className="contract-input w-[200px] ml-2 text-left"
              />
            )}
          </label>
        </div>

        <p className="contract-p">
          <strong>Late Payment Terms:</strong> A late fee of $
          <input
            type="number"
            step="0.01"
            value={formData.lateFeeAmount}
            onChange={(e) => updateField("lateFeeAmount", e.target.value)}
            placeholder="0.00"
            className="contract-input w-[60px]"
          />{" "}
          or{" "}
          <input
            type="number"
            step="0.1"
            value={formData.lateFeePercentage}
            onChange={(e) => updateField("lateFeePercentage", e.target.value)}
            placeholder="0"
            className="contract-input w-[50px]"
          />
          % of the outstanding balance may be applied for payments not received
          within{" "}
          <input
            type="number"
            value={formData.lateFeeDays}
            onChange={(e) => updateField("lateFeeDays", e.target.value)}
            placeholder="0"
            className="contract-input w-[50px]"
          />{" "}
          days of the due date.
        </p>

        {/* SIGNATURES SECTION */}
        <div className="contract-signature-section">
          <h3 className="contract-h3">SIGNATURES</h3>

          <SignatureBlock
            title="FOR THE SERVICE PROVIDER"
            companyName={formData.serviceProviderCompany}
            personName={formData.serviceProviderName}
            signatureData={formData.developerSignature}
            signatureAlt="Service provider signature"
            date={formData.day && formData.month && formData.year
              ? `${formData.month} ${formData.day}, ${formData.year}`
              : ""}
            className="contract-signature-block"
          />

          <SignatureBlock
            title="FOR THE CLIENT"
            companyName={formData.clientCompanyName}
            personName={typedName || formData.clientFirstName}
            signatureData={signatureData}
            signatureAlt="Client signature"
            date={isClientView
              ? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : formData.day && formData.month && formData.year
                ? `${formData.month} ${formData.day}, ${formData.year}`
                : ""}
          />
        </div>
      </div>

      {/* DOWNLOAD BUTTONS */}
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

export const HostingContract = {
  id: "hosting",
  name: "Website Hosting and Maintenance Agreement",
  defaultFields: {
    serviceProviderName: "",
    serviceProviderCompany: "",
    serviceProviderLocation: "",
    developerSignature: "", // Developer signature from business profile
    clientFirstName: "",
    clientCompanyName: "",
    clientAddress: "",
    clientEmail: "",
    clientPhone: "",
    day: currentDate.day,
    month: currentDate.month,
    year: currentDate.year,
    websiteType: "static",
    dynamicFeatures: "",
    maintenanceServices: [],
    contentUpdates: [],
    formMonitoring: false,
    formspreeManagement: "service-provider",
    serviceStartDate: "",
    billingPeriod: "monthly",
    totalFee: "",
    feeFrequency: "month",
    invoicingMethod: "recurring",
    invoicingOther: "",
    lateFeeAmount: "",
    lateFeePercentage: "",
    lateFeeDays: "",
    additionalNotes: "",
    // Tier selection: 'hosting-only', 'hosting-basic', 'hosting-priority'
    selectedTier: null,
  },
  SidebarForm: HostingSidebarForm,
  Document: HostingDocument,
};
