const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url) {
  let lastError;

  // 🔁 First 2 immediate attempts
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("API failed");
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }

  // ⏳ Wait 1 second
  await sleep(1000);

  // 🔁 Second set of 2 attempts
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("API failed");
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      status: false,
      message: "username parameter missing",
      api: "OᴘᴇɴOsɪɴᴛX"
    });
  }

  const url = `https://tginfo-production.up.railway.app/info?username=${username}`;

  try {
    const json = await fetchWithRetry(url);

    if (json.status !== "success" || !json.data) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        api: "OᴘᴇɴOsɪɴᴛX"
      });
    }

    const user = json.data;

    return res.status(200).json({
      status: true,
      api: "OᴘᴇɴOsɪɴᴛX",
      chat_id: user.id || null,
      first_name: user.first_name || null,
      last_name: user.last_name || null
    });

  } catch (error) {
    return res.status(502).json({
      status: false,
      message: "Upstream API failed after 4 retries",
      api: "OᴘᴇɴOsɪɴᴛX"
    });
  }
}