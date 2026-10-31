import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { nav, site } from "@/lib/site";
import { LogoMark, Wordmark } from "./Logo";
import { Icon } from "@/components/icons/Icon";

export async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-mist">
      <div className="mx-auto max-w-[1240px] px-5 pb-28 pt-14 sm:px-8 sm:pt-16 lg:pb-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg" aria-label={`${site.name} — ${t("nav.home")}`}>
              <LogoMark size={28} />
              <Wordmark />
            </Link>
            <p className="mt-4 max-w-[42ch] text-[14.5px] leading-relaxed text-slate">{t("footer.description")}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-graphite ring-1 ring-line">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
              {t("common.brandAttribution")}
            </p>
          </div>

          <nav aria-labelledby="footer-explore" className="md:col-span-2">
            <h2 id="footer-explore" className="font-mono text-[11px] uppercase tracking-[0.12em] text-steel">{t("footer.explore")}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14.5px] md:grid-cols-1">
              {nav.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="text-graphite hover:text-signal">{t(`nav.${item.key}`)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-steel">{t("footer.portal")}</h2>
            <a href={site.signInUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[14.5px] text-graphite hover:text-signal">
              {t("footer.portalSignIn")}
              <Icon name="arrowUpRight" size={14} />
              <span className="sr-only"> {t("common.opensInNewTab")}</span>
            </a>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-steel">{t("footer.contact")}</h2>
            <ul className="mt-4 space-y-2.5 text-[14.5px] text-graphite">
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-signal">
                  <Icon name="mail" size={16} className="text-steel" />
                  {site.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <Icon name="pin" size={16} className="text-steel" />
                {t("footer.location")}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-[12.5px] text-steel sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.name}. {t("footer.rights")}</p>
          <p>{t("footer.availability")}</p>
        </div>
      </div>
    </footer>
  );
}
