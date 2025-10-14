// import "normalize.css";
import "../globals.css";

import { createRootRoute, Outlet } from "@tanstack/react-router";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Link } from "@tanstack/react-router";

import { CoffeeCup } from "@/components/blocks/coffee-cup";

const RootLayout = () => (
  <>
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
              <Link to="/topics">Topics</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
    <div className="min-h-dvh flex flex-col">
      <main className="pt-20 mx-6 flex-1 min-h-dvh">
        <Outlet />
      </main>
      <footer className="p-6 flex-0 border-t">
        <section className="flex justify-between items-center">
          <CoffeeCup size="xs" />
          <pre>Coffee Fueled Dev | {new Date(Date.now()).getFullYear()}</pre>
        </section>
      </footer>
    </div>
  </>
);

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <>404</>,
});
