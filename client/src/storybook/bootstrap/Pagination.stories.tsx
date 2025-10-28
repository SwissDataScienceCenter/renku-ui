import { Meta, StoryObj } from "@storybook/react";
import { useMemo } from "react";
import { useSearchParams } from "react-router";
import Pagination from "../../components/Pagination";

const componentDescription = `
Use pagination wherever showing a potentially big number of objects. This requires proper API support to be efficient.

The Search page is a good example.
`;

export default {
  args: {
    elements: 55,
    perPage: 12,
  },
  argTypes: {
    elements: {
      description: "Number of available elements.",
      type: {
        name: "number",
      },
    },
    perPage: {
      description: "Number of elements per page.",
      type: {
        name: "number",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
  title: "Bootstrap/Pagination",
} as Meta;

interface PaginationInfoProps extends React.HTMLAttributes<HTMLDivElement> {
  elements: number;
  perPage: number;
}
type Story = StoryObj<PaginationInfoProps>;

export const Pagination_: Story = {
  render: function Pagination_Story({ elements, perPage }) {
    const [search] = useSearchParams();
    const currentPage = useMemo(() => {
      const pageRaw = search.get("page");
      if (!pageRaw) {
        return 1;
      }
      try {
        const page = parseInt(pageRaw, 10);
        return page > 0 ? page : 1;
      } catch {
        return 1;
      }
    }, [search]);

    return (
      <>
        {perPage < elements ? (
          <p className="fst-italic">
            Showing elements {perPage * (currentPage - 1) + 1} to{" "}
            {Math.min(perPage * currentPage, elements)} out of {elements}.
          </p>
        ) : (
          <p className="fst-italic">
            No need for pagination since {elements} elements fits in a single
            page showing up to {perPage} elements.
          </p>
        )}
        <Pagination
          currentPage={currentPage}
          perPage={perPage}
          totalItems={elements}
          pageQueryParam="page"
        />
      </>
    );
  },
};
