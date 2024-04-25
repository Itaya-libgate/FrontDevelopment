import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";

const Item = ({ id }: { id: UniqueIdentifier }) => {
  return (
    <div style={{ flexGrow: 1, maxWidth: "100%" }}>{id}</div> // Flex container style applied to Item
  );
};

const SortableItem = ({ id }: { id: UniqueIdentifier }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        border: "2px solid black",
        padding: "5px",
        borderRadius: "5px",
        margin: 0,
        outline: "none",
        display: "flex", // Flex container style applied to SortableItem
      }}
      {...attributes}
      {...listeners}
    >
      <Item id={id} />
    </div>
  );
};

export default SortableItem;
