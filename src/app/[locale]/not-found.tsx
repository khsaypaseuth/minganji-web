import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations();
  return (
    <section className="py-28">
      <Container className="max-w-[720px] text-center">
        <p className="eyebrow">404</p>
        <h1 className="font-display mt-4 text-[clamp(2rem,4vw,3rem)] font-semibold text-ink">{t("notFound.title")}</h1>
        <p className="mt-4 text-slate">{t("notFound.body")}</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/" arrow>{t("common.backToHome")}</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">{t("common.contactUs")}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
