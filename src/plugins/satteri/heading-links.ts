import { defineHastPlugin } from "satteri"

export const satteriAutolinkHeadings = defineHastPlugin({
  name: "autolink-headings",
  element: {
    filter: ["h2", "h3", "h4", "h5", "h6"],
    visit(node, context) {
      const id = node.properties?.id
      if (typeof id !== "string") return

      context.setProperty(node, "className", ["heading-element"])
      context.setProperty(node, "tabIndex", "-1")
      context.prependChild(node, {
        children: [
          {
            children: [],
            properties: { className: ["anchor-icon"] },
            tagName: "span",
            type: "element",
          },
        ],
        properties: {
          ariaLabel: "Link to self",
          className: ["anchor-link"],
          href: `#${id}`,
        },
        tagName: "a",
        type: "element",
      })
    },
  },
})
