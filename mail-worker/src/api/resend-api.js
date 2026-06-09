import resendService from '../service/resend-service';
import app from '../hono/hono';
app.post('/webhooks',async (c) => {
	let body;
	try {
		body = await c.req.json();
	} catch (e) {
		console.warn(`Resend webhook JSON 解析失败: ${e.message}`);
		return c.text('invalid json', 400)
	}

	try {
		await resendService.webhooks(c, body);
		return c.text('success', 200)
	} catch (e) {
		return  c.text(e.message, 500)
	}
})
