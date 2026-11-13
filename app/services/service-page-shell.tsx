import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "../components/navbar";
import { Footer } from "../components/home/sections";
import styles from "./service-page.module.css";

export function ServicePageShell({
  eyebrow,
  title,
  introduction,
  relatedPath,
  relatedLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  relatedPath: string;
  relatedLabel: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar homeLinks />
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={`wrap ${styles.heroInner}`}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1>{title}</h1>
            <p className={styles.introduction}>{introduction}</p>
            <div className={styles.actions}>
              <Link className="btn btn-gold" href="/#enquire">Discuss your home <span aria-hidden="true">↗</span></Link>
              <Link className="btn btn-outline" href={relatedPath}>{relatedLabel}</Link>
            </div>
          </div>
        </header>
        <article className={`wrap ${styles.content}`}>{children}</article>
      </main>
      <Footer homeLinks />
    </>
  );
}

