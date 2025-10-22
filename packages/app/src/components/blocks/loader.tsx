import { motion } from "motion/react";
import { Item, ItemContent, ItemMedia, ItemTitle } from "../ui/item";
import { Spinner } from "../ui/spinner";

export const Loader = ({
  task,
  feature,
}: {
  task: string;
  feature?: string;
}) => (
  <motion.div
    key="loader"
    className="size-full flex flex-col items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">{task}</ItemTitle>
        </ItemContent>
        {feature && (
          <ItemContent className="flex-none justify-end">
            <span className="text-sm tabular-nums">{feature}</span>
          </ItemContent>
        )}
      </Item>
    </div>
  </motion.div>
);
