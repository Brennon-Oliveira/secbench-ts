import type { FastifyInstance } from 'fastify'

import { registerCallback } from './modules/auth/routes/callback.js'
import { registerLogin } from './modules/auth/routes/login.js'
import { registerPasswordChange } from './modules/auth/routes/password-change.js'
import { registerPasswordRotate } from './modules/auth/routes/password-rotate.js'
import { registerRecoveryRequest } from './modules/auth/routes/recovery-request.js'
import { registerRegister } from './modules/auth/routes/register.js'
import { registerResetRequest } from './modules/auth/routes/reset-request.js'
import { registerReturnPath } from './modules/auth/routes/return-path.js'
import { registerSession } from './modules/auth/routes/session.js'
import { registerSignin } from './modules/auth/routes/signin.js'
import { registerSignup } from './modules/auth/routes/signup.js'
import { registerToken } from './modules/auth/routes/token.js'

import { registerAttach } from './modules/files/routes/attach.js'
import { registerDownload } from './modules/files/routes/download.js'
import { registerFetchFile } from './modules/files/routes/fetch-file.js'
import { registerImageProxy } from './modules/files/routes/image-proxy.js'
import { registerImageRender } from './modules/files/routes/image-render.js'
import { registerInvoiceAttachment } from './modules/files/routes/invoice-attachment.js'
import { registerInvoiceDocument } from './modules/files/routes/invoice-document.js'
import { registerUpload } from './modules/files/routes/upload.js'

import { registerApplyConfig } from './modules/integrations/routes/apply-config.js'
import { registerDispatch } from './modules/integrations/routes/dispatch.js'
import { registerFeedFetch } from './modules/integrations/routes/feed-fetch.js'
import { registerFeedImport } from './modules/integrations/routes/feed-import.js'
import { registerPublish } from './modules/integrations/routes/publish.js'
import { registerTimingFormat } from './modules/integrations/routes/timing-format.js'
import { registerTimingParse } from './modules/integrations/routes/timing-parse.js'
import { registerUpdateConfig } from './modules/integrations/routes/update-config.js'

import { registerFilterOrders } from './modules/orders/routes/filter-orders.js'
import { registerGetOrder } from './modules/orders/routes/get-order.js'
import { registerOrderDetails } from './modules/orders/routes/order-details.js'
import { registerPayment } from './modules/orders/routes/payment.js'
import { registerPreview } from './modules/orders/routes/preview.js'
import { registerReceipt } from './modules/orders/routes/receipt.js'
import { registerSearchOrders } from './modules/orders/routes/search-orders.js'
import { registerSettle } from './modules/orders/routes/settle.js'
import { registerSummary } from './modules/orders/routes/summary.js'
import { registerTrackingGenerate } from './modules/orders/routes/tracking-generate.js'
import { registerTrackingIssue } from './modules/orders/routes/tracking-issue.js'
import { registerVoucher } from './modules/orders/routes/voucher.js'

import { registerCalculate } from './modules/reports/routes/calculate.js'
import { registerConvertReport } from './modules/reports/routes/convert-report.js'
import { registerFormula } from './modules/reports/routes/formula.js'
import { registerTransformReport } from './modules/reports/routes/transform-report.js'

import { registerCleanup } from './modules/system/routes/cleanup.js'
import { registerConnectivity } from './modules/system/routes/connectivity.js'
import { registerDiagnostics } from './modules/system/routes/diagnostics.js'
import { registerHealth } from './modules/system/routes/health.js'
import { registerPurge } from './modules/system/routes/purge.js'
import { registerSystemReport } from './modules/system/routes/report.js'
import { registerSystemStatus } from './modules/system/routes/status.js'

import { registerAdminAccounts } from './modules/users/routes/admin-accounts.js'
import { registerAdminUsers } from './modules/users/routes/admin-users.js'
import { registerFindUser } from './modules/users/routes/find-user.js'
import { registerImportPreferences } from './modules/users/routes/import-preferences.js'
import { registerLoadPreferences } from './modules/users/routes/load-preferences.js'
import { registerLookupUser } from './modules/users/routes/lookup-user.js'
import { registerProfileCheck } from './modules/users/routes/profile-check.js'
import { registerProfileValidate } from './modules/users/routes/profile-validate.js'
import { registerSaveDocument } from './modules/users/routes/save-document.js'
import { registerStoreDocument } from './modules/users/routes/store-document.js'

/** Register by module, then alphabetical path within the module (PROJETO §7.8). */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await registerCallback(app)
  await registerLogin(app)
  await registerPasswordChange(app)
  await registerPasswordRotate(app)
  await registerRecoveryRequest(app)
  await registerRegister(app)
  await registerResetRequest(app)
  await registerReturnPath(app)
  await registerSession(app)
  await registerSignin(app)
  await registerSignup(app)
  await registerToken(app)

  await registerAttach(app)
  await registerDownload(app)
  await registerFetchFile(app)
  await registerImageProxy(app)
  await registerImageRender(app)
  await registerInvoiceAttachment(app)
  await registerInvoiceDocument(app)
  await registerUpload(app)

  await registerApplyConfig(app)
  await registerUpdateConfig(app)
  await registerDispatch(app)
  await registerFeedFetch(app)
  await registerFeedImport(app)
  await registerPublish(app)
  await registerTimingFormat(app)
  await registerTimingParse(app)

  await registerFilterOrders(app)
  await registerGetOrder(app)
  await registerOrderDetails(app)
  await registerPayment(app)
  await registerPreview(app)
  await registerReceipt(app)
  await registerSearchOrders(app)
  await registerSettle(app)
  await registerSummary(app)
  await registerTrackingGenerate(app)
  await registerTrackingIssue(app)
  await registerVoucher(app)

  await registerCalculate(app)
  await registerConvertReport(app)
  await registerFormula(app)
  await registerTransformReport(app)

  await registerCleanup(app)
  await registerConnectivity(app)
  await registerDiagnostics(app)
  await registerHealth(app)
  await registerPurge(app)
  await registerSystemReport(app)
  await registerSystemStatus(app)

  await registerAdminAccounts(app)
  await registerAdminUsers(app)
  await registerFindUser(app)
  await registerImportPreferences(app)
  await registerLoadPreferences(app)
  await registerLookupUser(app)
  await registerProfileCheck(app)
  await registerProfileValidate(app)
  await registerSaveDocument(app)
  await registerStoreDocument(app)
}

