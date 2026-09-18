export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { text, targetLanguage } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Falta configurar GEMINI_API_KEY en Vercel."
    });
  }

  if (!text) {
    return res.status(400).json({
      error: "Falta el texto."
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Traduce el siguiente texto de vocabulario de programación al ${targetLanguage || "español"}, manteniendo el contexto técnico. Responde solo con la traducción:

"${text}"`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Error de Gemini"
      });
    }

    const translation =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!translation) {
      return res.status(500).json({
        error: "Gemini no devolvió ninguna traducción."
      });
    }

    return res.status(200).json({ translation });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error al traducir con Gemini"
    });
  }
}
