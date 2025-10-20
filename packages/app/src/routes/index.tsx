import { CoffeeCup } from "@/components/blocks/coffee-cup";
import { InlineLink } from "@/components/blocks/external-link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

const BunLink = () => (
  <InlineLink href="https://bun.com/docs/bundler/fullstack">Bunjs</InlineLink>
);

const TSRLink = () => (
  <InlineLink href="https://tanstack.com/router/latest/docs/framework/react/installation/with-router-cli">
    Tanstack Router
  </InlineLink>
);

const CFDLink = () => (
  <InlineLink href="https://github.com/coffee-fueled-dev/very-coffee">
    Tanstack Router
  </InlineLink>
);

function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-6 p-6">
      <CoffeeCup />
      <section className="max-w-lg text-center space-y-4">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Hey there, I'm Zach
        </h4>
        <Separator />
        <p className="leading-7">
          I'm a software engineer, design engineer, and Olympic athlete
          (archery, team USA). I work on coding projects in my free time. I've
          noticed that the mere idea of sharing those projects leads to an
          explosion of complexity, where user accounts, domains, databases and
          the like become requirements. I made this site as a way to force
          myself to keep things simple, to share my thoughts about various
          things, and to use this sick domain name I've been sitting on. Feel
          free to read my stuff, and check out demos as I add them.
        </p>
        <Separator />
        <div className="space-y-2">
          <p className="leading-7">
            These are the things I've been most interested in lately:
          </p>
          <span className="space-x-2 p-6">
            <Link to="/blog/$" params={{ _splat: "tkn" }}>
              <Button size="sm" variant="secondary">
                TKN
              </Button>
            </Link>
            <Link to="/blog/$" params={{ _splat: "tkn/pattern-discovery" }}>
              <Button size="sm" variant="secondary">
                TKN demo!
              </Button>
            </Link>
          </span>
        </div>
        <p className="text-xs">
          Btw, this site is built entirely with <BunLink />
          and <TSRLink />. It's quick and super tiny. If you're curious how that
          works, you can check out the source code <CFDLink />
        </p>
      </section>
    </div>
  );
}
