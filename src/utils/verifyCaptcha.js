const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

const verifyCaptcha = async (token) => {
  const fetch = (await import('node-fetch')).default;

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
  });

  const data = await response.json();
  return data.success;
};

module.exports = verifyCaptcha;
