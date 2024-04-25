import React, { useState } from "react";
import Papa from "papaparse";
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
    allOrders: [],
    container1: [],
    container2: [],
    container3: [],
    container4: [],
    container5: [],
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

  // CSVファイルを読み込んで注文情報をセットする関数
  const handleCSVUpload = (file: File) => {
    Papa.parse(file, {
      complete: (result) => {
        // CSVの2行目以降を取り込み、全値を結合して一つの行にする
        const orders = result.data.slice(1).map((row) => {
          if (Array.isArray(row)) {
            return row.slice().join(",");
          }
          return ""; // エラー処理など
        });        
        setItems((prev) => ({ ...prev, allOrders: orders }));
      },
      header: false,
      encoding: "Shift-JIS",
    });
  };

  return (
    <div className="flex flex-row mx-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col ml-4">
          {/* ファイル選択 */}
          <div className="mb-4">
            <input 
              type="file" 
              accept=".csv" 
              onChange={(event) => {
                const file = event.target.files ? event.target.files[0] : undefined;
                if (file) {
                  handleCSVUpload(file);
                }
              }} 
            />
          </div>

          <div className="flex flex-row">
            {/* 注文一覧 */}
            <SortableContainer key="allOrders" id="allOrders" label="注文一覧" items={items.allOrders} />
            {/* 印刷機1から6まで */}
            {Object.entries(items).map(([containerId, containerItems]) => {
              if (containerId !== "allOrders") {
                const machineNumber = parseInt(containerId.replace("container", ""));
                return (
                  <SortableContainer key={containerId} id={containerId} label={`印刷機${machineNumber}`} items={containerItems} />
                );
              }
              return null;
            })}
          </div>
        </div>

        <DragOverlay>{activeId ? <Item id={activeId} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
};

export default Container;
