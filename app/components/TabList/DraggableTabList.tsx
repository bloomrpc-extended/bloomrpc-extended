import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableItemProps {
  children: React.ReactElement;
  active?: boolean;
  id: string;
}

export function DraggableItem({ children, active, id }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'inline-block',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`inline-item ${active ? "active" : ""}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
