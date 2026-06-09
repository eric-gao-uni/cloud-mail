import emailService from './email-service';
import { emailConst } from '../const/entity-const';

const statusByEventType = {
	'email.sent': emailConst.status.SENT,
	'email.delivered': emailConst.status.DELIVERED,
	'email.complained': emailConst.status.COMPLAINED,
	'email.bounced': emailConst.status.BOUNCED,
	'email.delivery_delayed': emailConst.status.DELAYED,
	'email.failed': emailConst.status.FAILED
}

const resendService = {

	async webhooks(c, body) {

		const eventType = body?.type;
		const resendEmailId = body?.data?.email_id;
		const status = statusByEventType[eventType];

		if (!status) {
			console.warn(`忽略未处理的 Resend webhook 事件: ${eventType || 'unknown'}`);
			return;
		}

		if (!resendEmailId) {
			console.warn(`忽略缺少 email_id 的 Resend webhook 事件: ${eventType}`);
			return;
		}

		const params = {
			resendEmailId,
			status
		}

		if (body.type === 'email.delivered') {
			params.message = null
		}

		if (body.type === 'email.complained') {
			params.message = null
		}

		if (body.type === 'email.bounced') {
			let bounce = body.data.bounce
			bounce = JSON.stringify(bounce);
			params.message = bounce
		}

		if (body.type === 'email.delivery_delayed') {
			params.message = null
		}

		if (body.type === 'email.failed') {
			params.message = body.data.failed?.reason || null
		}

		const emailRow = await emailService.updateEmailStatus(c, params)

		if (!emailRow) {
			console.warn(`忽略无法匹配本地邮件的 Resend webhook 事件: ${eventType}, email_id: ${resendEmailId}`);
		}

	}
}

export default resendService
