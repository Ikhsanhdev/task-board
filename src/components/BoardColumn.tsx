
import TaskCard from './TaskCard';
import './BoardColumn.css';

type ChecklistItem = {
    id: number;
    text: string;
    completed: boolean;
};

type Task = {
    id: number;
    title: string;
    description: string;
    label: string;
    assignee: string;
    dueDate: string;
    priority?: string;
    checklist?: ChecklistItem[];
    attachments?: string[];
};

type BoardColumnProps = {
    title: string;
    tasks: Task[];
    onAddTask: () => void;
    onDeleteTask: (taskId: number) => void;
    onOpenTask: (task: Task) => void;
    onDragStart: (taskId: number) => void;
    onDropTask: (targetColumnId: string) => void;
    columnId: string;
};

const BoardColumn: React.FC<BoardColumnProps> = ({
    title,
    tasks,
    onAddTask,
    onDeleteTask,
    onOpenTask,
    columnId,
    onDragStart,
    onDropTask
}) => {
    return (
        <section className="board-column" onDragOver={e => e.preventDefault()} onDrop={() => onDropTask(columnId)}>
            <div className="column-header">
                <div className="column-title">
                    <h2>{title}</h2>
                    <span className="task-count">{tasks.length}</span>
                </div>

                <button
                    className="add-column-task-btn"
                    onClick={onAddTask}
                    title="Add task"
                >
                    +
                </button>
            </div>

            <div className="column-tasks">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={() => onDeleteTask(task.id)}
                        onOpen={() => onOpenTask(task)}
                        onDragStart={onDragStart}
                        onDragEnd={() => {}}
                    />
                ))}
            </div>
        </section>
    );
};

export default BoardColumn;