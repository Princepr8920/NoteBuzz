const userAgent = require("useragent"),
  emailSender = require("./emailGenerator"),
  sendNewEmail = new emailSender();

async function Agent(data) {
  const { agentInfo, username, email } = data,
    configUserAgent = userAgent.parse(agentInfo),
    info = {
      browser: `${configUserAgent.family}, ${configUserAgent.toVersion()}`,
      os: `${configUserAgent.os.family} ${configUserAgent.os.toVersion()}`,
    };

  let emailSent = await sendNewEmail.login_notification({
    username,
    email,
    secret: info,
  });
  return emailSent;
}

module.exports = Agent;
