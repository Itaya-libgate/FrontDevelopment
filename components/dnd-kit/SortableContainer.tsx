import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

const SortableContainer = ({
  id,
  items,
  label,
}: {
  id: string;
  items: string[];
  label: string;
}) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col" style={{ margin: "0 10px" }}> {/* ここで margin を追加 */}
      <h3 className="text-xl font-bold text-center">{label}</h3>
      <div
        ref={setNodeRef}
        className="flex flex-wrap border-2 border-gray-500/75 p-2 mt-2 rounded-md"
        style={{ minHeight: "80px", minWidth: "210px" }} // コンテナの高さと幅を変更
      >
        <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
          {items.map((id: string) => (
            <SortableItem key={id} id={id} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default SortableContainer;
