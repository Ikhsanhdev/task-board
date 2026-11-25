
import './TaskCard.css';

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

type TaskCardProps = {
    task: Task;
    onDelete: () => void;
    onOpen: () => void;
    onDragStart: (taskId: number) => void;
    onDragEnd: () => void; 
};

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    onDelete,
    onOpen,
    onDragStart,
    onDragEnd
}) => {
    const completedCount = task.checklist?.filter((item) => item.completed).length || 0;

    const totalCount = task.checklist?.length || 0;
    const attachCount = task.attachments?.length || 0;
    const progress = totalCount ? (completedCount / totalCount) * 100 : 0;

    return (
        <article className="task-card" draggable onDragStart={() => onDragStart(task.id)} onDragEnd={onDragEnd}>
            <div className="task-card-top">
                <span className={`task-label label-${task.label.toLowerCase()}`}>
                    {task.label}
                </span>

                <button
                    className="task-menu"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    title="Delete task"
                >
                ×
                </button>
            </div>

            <div className="task-card-content" onClick={onOpen}>
                {totalCount > 0 && (
                    <div className="card-progress">
                        <div
                            className={`card-progress-fill ${progress === 100 ? 'complete' : ''}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>

                <div className="task-footer">
                    <span className="task-assignee">
                        <span className="avatar avatar-blue">
                            {task.assignee.charAt(0)}
                        </span>
                        {task.assignee}
                    </span>

                    <div className="task-footer-right">
                        {(totalCount > 0 || attachCount > 0) && (
                            <div className="card-meta">
                                {totalCount > 0 && <span>☑ {completedCount}/{totalCount}</span>}
                                {attachCount > 0 && <span>📎 {attachCount}</span>}
                            </div>
                        )}

                        <span className="task-date">
                            {task.dueDate && !isNaN(Date.parse(task.dueDate))
                                ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })
                                : task.dueDate}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default TaskCard;