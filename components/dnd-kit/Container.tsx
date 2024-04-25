import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import SortableContainer from "./SortableContainer";
import Item from "./Item";

const Container = () => {
  const [items, setItems] = useState<{
    [key: string]: string[];
  }>({
    container1: ["A", "B", "C"],
    container2: ["D", "E", "F"],
    container3: ["G", "H", "I"],
    container4: [],
    container5: [
      "1",
      "A1",
      "23105449",
      "8000",
      "2023/12/8",
      "6",
      "100",
      "0",
      "5(表：0 × 裏：5)、墨/C/M/Y/白",
      "",
      "1",
      "A2",
      "23106308",
      "8000",
      "2023/12/7",
      "5",
      "10",
      "9",
      "5(表：0 × 裏：5)、K/C/M/Y/白",
    ],
    container6: [],
  });

  const [activeId, setActiveId] = useState<UniqueIdentifier>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key: string) =>
      items[key].includes(id.toString())
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id.toString();
    setActiveId(id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const id = active.id.toString();
    const overId = over?.id;

    if (!overId) return;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(over?.id);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    const activeItems = items[activeContainer];
    const overItems = items[overContainer];

    const activeIndex = activeItems.indexOf(id);
    const overIndex = overItems.indexOf(overId.toString());

    let newIndex;
    if (overId in items) {
      newIndex = overItems.length;
    } else {
      const isBelowLastItem =
        over && overIndex === overItems.length - 1;

      const modifier = isBelowLastItem ? 1 : 0;

      newIndex =
        overIndex >= 0 ? overIndex + modifier : overItems.length;
    }

    setItems((prev) => ({
      ...prev,
      [activeContainer]: [
        ...prev[activeContainer].filter((item) => item !== id),
      ],
      [overContainer]: [
        ...prev[overContainer].slice(0, newIndex),
        id,
        ...prev[overContainer].slice(newIndex),
      ],
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const id = active.id.toString();
    const overId = over?.id;

    if (!overId) return;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(over?.id);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = items[activeContainer].indexOf(id);
    const overIndex = items[overContainer].indexOf(overId.toString());

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(
          items[overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }
    setActiveId(undefined);
  };

  // 新しいコンテナを追加して、すべての値を結合して表示
  const allValues = Object.values(items).flat();

  return (
    <div className="flex flex-row mx-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* 新しいコンテナにすべての値を表示 */}
        <SortableContainer id="all" label="全注文" items={allValues} />
        <SortableContainer id="container1" items={items.container1} label="印刷機1" />
        <SortableContainer id="container2" label="印刷機2" items={items.container2} />
        <SortableContainer id="container3" label="印刷機3" items={items.container3} />
        <SortableContainer id="container4" label="印刷機4" items={items.container4} />
        <SortableContainer id="container5" label="印刷機5" items={items.container5} />
        <SortableContainer id="container6" label="印刷機6" items={items.container6} />
        <DragOverlay>{activeId ? <Item id={activeId} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
};

export default Container;
