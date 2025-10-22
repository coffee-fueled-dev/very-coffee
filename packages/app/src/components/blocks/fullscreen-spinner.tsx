import { Item, ItemContent, ItemMedia, ItemTitle } from "../ui/item";
import { Spinner } from "../ui/spinner";

export const FullscreenSpinner = ({
  task,
  feature,
}: {
  task: string;
  feature?: string;
}) => (
  <div className="size-full min-h-[400px] flex flex-col items-center justify-center">
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
  </div>
);
