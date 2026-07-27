/**
 * SSR-safe JSON-LD injector.
 * Accepts a single schema object or an array of schema documents.
 * Escapes `<` to prevent script-breakout XSS in JSON-LD.
 */
export default function JsonLd({ data }) {
  if (!data) return null

  const docs = Array.isArray(data) ? data.filter(Boolean) : [data]

  return (
    <>
      {docs.map((doc, i) => {
        const json = JSON.stringify(doc).replace(/</g, '\\u003c')
        const key =
          doc['@id'] ||
          doc['@graph']?.[0]?.['@id'] ||
          `jsonld-${i}`
        return (
          <script
            key={key}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: json }}
          />
        )
      })}
    </>
  )
}
