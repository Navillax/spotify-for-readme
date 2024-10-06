export default async function handler(req, res) {
  const client_id = process.env.CLIENT_ID; // Se obtiene de las variables de entorno
  const client_secret = process.env.CLIENT_SECRET; // Se obtiene de las variables de entorno
  const refresh_token = process.env.REFRESH_TOKEN; // Se obtiene de las variables de entorno

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  // Petición para refrescar el token
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
  });

  const data = await response.json();

  if (data.error) {
    return res.status(400).json({ error: "No se pudo refrescar el token" });
  }

  const access_token = data.access_token;

  // Petición a la API de Spotify para obtener la canción actual
  const trackResponse = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  if (trackResponse.status === 204 || trackResponse.status > 400) {
    return res.status(200).json({ is_playing: false });
  }

  const trackData = await trackResponse.json();

  return res.status(200).json(trackData);
}
