import { ChevronRightIcon } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { Badge } from "../ui/badge";

export interface Topic {
  link: Omit<LinkComponentProps, "children">;
  title: string;
  description: string;
  posts: number;
}

export const TopicList = ({ topics }: { topics: Topic[] }) => (
  <div className="flex flex-col gap-4">
    {topics.map((topic) => (
      <TopicItem {...topic} key={topic.title} />
    ))}
  </div>
);

export const TopicItem = ({ title, description, posts, link }: Topic) => (
  <Item variant="outline" size="sm" asChild>
    <Link {...link}>
      <ItemMedia>
        <Badge variant="secondary">
          {posts} {posts === 1 ? "post" : "posts"}
        </Badge>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4" />
      </ItemActions>
    </Link>
  </Item>
);
