
import { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons';
import './TaskDetailModal.css';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonPopover,
    IonDatetime
} from '@ionic/react';

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

type TaskDetailModalProps = {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onSave: (updatedData: Partial<Task>) => void;
    assignees: string[];
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    isOpen,
    task,
    onClose,
    onSave,
    assignees
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [label, setLabel] = useState('Undefined');
    const [assignee, setAssignee] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);

    const [popoverState, setPopoverState] = useState<{
        open: boolean;
        event?: Event;
    }>({ open: false });

    useEffect(() => {
        if (task && isOpen) {
            setTitle(task.title);
            setDescription(task.description);
            setLabel(task.label);
            setAssignee(task.assignee);
            setDueDate(task.dueDate === 'No Date' ? '' : task.dueDate);
            setPriority(task.priority || 'Medium');
            setChecklist(task.checklist || []);
            setNewChecklistItem('');
            setAttachments(task.attachments || []);
        }
    }, [task, isOpen]);

    const addChecklistItem = () => {
        if (!newChecklistItem.trim()) return;

        setChecklist((prev) => [
            ...prev,
            {
                id: Date.now(),
                text: newChecklistItem,
                completed: false,
            },
        ]);

        setNewChecklistItem('');
    };

    const toggleChecklistItem = (id: number) => {
        setChecklist((prev) =>
            prev.map((item) =>
                item.id === id
                ? { ...item, completed: !item.completed }
                : item
            )
        );
    };

    const deleteChecklistItem = (id: number) => {
        setChecklist((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert('Task title cannot be empty');
            return;
        }

        onSave({
            title,
            description,
            label,
            assignee,
            dueDate: dueDate || 'No Date',
            priority,
            checklist,
            attachments
        });

        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        setAttachments(prev => [
            ...prev,
            ...files.map(file => file.name)
        ]);
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} className="task-detail-modal">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Task Details</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose} aria-label="Tutup">
                            <IonIcon slot="icon-only" icon={close} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding task-detail-content">
                <div className="task-detail-form">
                    <label>Task Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter task title"
                    />

                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter task description"
                        rows={4}
                    />

                    <div className="detail-grid">
                        <div>
                            <label>Label</label>
                            <select
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            >
                                <option value="Feature">Feature</option>
                                <option value="Bug">Bug</option>
                                <option value="Issue">Issue</option>
                                <option value="Undefined">Undefined</option>
                            </select>
                        </div>
                        <div>
                            <label>Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div>
                            <label>Assignee</label>
                            <select
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                            >
                                <option value="Unassigned">Unassigned</option>

                                {assignees
                                    .filter(name => name !== 'Unassigned')
                                    .map(name => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="date-field">
                            <label>Due Date</label>
                            <button
                                type="button"
                                className="date-picker-trigger"
                                onClick={(e) => setPopoverState({ open: true, event: e.nativeEvent })}
                            >
                                <span>📅</span>
                                {dueDate
                                    ? new Date(dueDate + 'T00:00:00').toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })
                                    : 'Due Date'}
                            </button>

                            <IonPopover
                                isOpen={popoverState.open}
                                event={popoverState.event}
                                onDidDismiss={() => setPopoverState({ open: false })}
                                className="date-picker-popover"
                                side="bottom"
                                alignment="start"
                                showBackdrop={false}
                                reference="trigger"
                            >
                                <IonDatetime
                                    presentation="date"
                                    locale="id-ID"
                                    value={dueDate || undefined}
                                    onIonChange={(e) => {
                                        const value = e.detail.value;

                                        if (typeof value === 'string') {
                                            setDueDate(value.slice(0, 10));
                                            setPopoverState({ open: false });
                                        }
                                    }}
                                />
                            </IonPopover>
                        </div>
                    </div>

                    <div className="checklist-section">
                        <h3>Checklist</h3>
                        <p>
                            {checklist.filter((item) => item.completed).length}
                            {' / '}
                            {checklist.length} completed
                        </p>

                        {checklist.map((item) => (
                            <div className="checklist-item" key={item.id}>
                                <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => toggleChecklistItem(item.id)}
                                />

                                <span className={item.completed ? 'completed' : ''}>
                                    {item.text}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => deleteChecklistItem(item.id)}
                                >
                                ×
                                </button>
                            </div>
                        ))}

                        <div className="checklist-add">
                            <input
                                value={newChecklistItem}
                                onChange={(e) => setNewChecklistItem(e.target.value)}
                                placeholder="Add checklist item"
                                onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addChecklistItem();
                                }
                                }}
                            />

                            <button type="button" onClick={addChecklistItem}>
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="detail-field">
                        <label>Attachments</label>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />

                        <ul>
                            {attachments.map((file, index) => (
                            <li key={`${file}-${index}`}>{file}</li>
                            ))}
                        </ul>
                    </div>

                    <button className="save-task-btn" onClick={handleSave}>Save Changes</button>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default TaskDetailModal;