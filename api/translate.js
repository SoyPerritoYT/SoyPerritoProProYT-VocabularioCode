export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { text, target } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Falta el texto" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Falta configurar OPENAI_API_KEY en las variables de entorno de Vercel."
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `Traduce el siguiente texto al idioma indicado. Responde solo con la traducción.
Idioma destino: ${target || "español"}
Texto: ${text}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Error de la API"
      });
    }

    return res.status(200).json({
      translation: data.output_text || ""
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
}
