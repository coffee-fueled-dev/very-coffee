import "normalize.css";
import "../globals.css";

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link } from "@tanstack/react-router";
import { CoffeeCup } from "@/components/blocks/coffee-cup";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SocialLinks } from "@/components/blocks/social-links";

import.meta.hot.accept();

const RootLayout = () => (
  <>
    <Toaster richColors />
    <header className="absolute w-full p-6 flex justify-end">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/blog">Topics</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
    <div className="min-h-dvh flex flex-col">
      <main className="py-20 mx-6 flex-1 min-h-dvh max-w-5xl w-full self-center">
        <Outlet />
      </main>
      <footer className="p-6 flex-0 border-t">
        <section className="flex justify-between items-center">
          <CoffeeCup size="xs" />
          <div className="flex flex-col justify-end text-right gap-2">
            <pre>Coffee Fueled Dev</pre>
            <pre className="text-muted-foreground">
              {new Date(Date.now()).getFullYear()}
            </pre>
            <Separator />
            <span className="flex items-center justify-end">
              <SocialLinks />
            </span>
          </div>
        </section>
      </footer>
    </div>
  </>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
      404
    </h1>
    <p className="text-xl text-muted-foreground">Page not found</p>
    <Link to="/">
      <Button variant="link">Go back home</Button>
    </Link>
  </div>
);

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
