import { formatPostTimestamp } from "@/lib/format";
import { listBlockedOrigins } from "@/services/moderation";
import { unblockOriginAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminOriginsPage() {
  const origins = await listBlockedOrigins();

  return (
    <div>
      <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] leading-none">
        Origens bloqueadas
      </h1>
      <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-brown-raised">
        Bloquear uma origem impede novas publicações daquele identificador
        (HMAC do IP) enquanto o bloqueio estiver ativo. Bloqueios permanentes
        não expiram; temporários são liberados automaticamente após a data.
      </p>

      {origins.length === 0 ? (
        <p className="mt-8 border-t border-brown-deep/20 pt-6 text-sm text-brown-raised">
          Nenhuma origem bloqueada no momento. O bloqueio pode ser feito na
          página de um post, em “Origem do post”.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Origens bloqueadas na moderação
            </caption>
            <thead>
              <tr className="border-b border-brown-deep/30 text-xs tracking-[0.12em] text-brown-raised uppercase">
                <th scope="col" className="py-3 pr-4 font-medium">
                  ip_hash
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Motivo
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Bloqueada em
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Expira
                </th>
                <th scope="col" className="py-3 font-medium">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown-deep/15">
              {origins.map((origin) => (
                <tr key={origin.id} className="align-top">
                  <td className="py-4 pr-4 text-xs break-all">
                    {origin.ipHash}
                  </td>
                  <td className="max-w-[24rem] py-4 pr-4">{origin.reason}</td>
                  <td className="py-4 pr-4 text-xs whitespace-nowrap text-brown-raised tabular">
                    {formatPostTimestamp(origin.blockedAt)}
                  </td>
                  <td className="py-4 pr-4 text-xs whitespace-nowrap tabular">
                    {origin.expiresAt
                      ? formatPostTimestamp(origin.expiresAt)
                      : "Permanente"}
                  </td>
                  <td className="py-4">
                    <form action={unblockOriginAction}>
                      <input
                        type="hidden"
                        name="ipHash"
                        value={origin.ipHash}
                      />
                      <input
                        type="hidden"
                        name="returnTo"
                        value="/admin/origens"
                      />
                      <button
                        type="submit"
                        className="rounded-md border border-brown-deep/40 px-3.5 py-2 text-xs font-medium tracking-[0.08em] uppercase transition-colors hover:bg-brown-deep hover:text-beige"
                      >
                        Desbloquear
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
