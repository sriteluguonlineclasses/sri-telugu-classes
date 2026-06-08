// Netlify serverless function — handles enrollment form
// Sends email via Web3Forms + SMS via Twilio

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email, phone;
  try {
    const data = JSON.parse(event.body);
    email = data.email || '';
    phone = data.phone || 'Not provided';
  } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const results = { sms: false };

  // ── Send SMS notification via Twilio ──────────────────────────
  try {
    const sid       = process.env.TWILIO_SID;
    const token     = process.env.TWILIO_AUTH_TOKEN;
    const fromNum   = process.env.TWILIO_FROM;
    const toNum     = '+18585377865';

    const smsBody   = `New Sri Telugu Classes enrollment!\nEmail: ${email}\nPhone: ${phone}`;
    const creds     = Buffer.from(`${sid}:${token}`).toString('base64');

    const smsRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization:  `Basic ${creds}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ To: toNum, From: fromNum, Body: smsBody }).toString()
      }
    );
    results.sms = smsRes.ok;
  } catch (e) {
    console.error('Twilio error:', e.message);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, results })
  };
};
