
import { IonContent, IonPage, IonToast } from '@ionic/react';
import {useState, useEffect} from 'react';
import Navbar from '../components/Navbar';
import BoardColumn from '../components/BoardColumn';
import TaskDetailModal from '../components/TaskDetailModal';
import './Home.css';

type ChecklistItem = {
  id: number;
  text: string;
  completed: boolean;
};

// Struktur data task
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

// Struktur data column
type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

// Dummy data board
const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      {
        id: 1,
        title: 'Create Login Page',
        description: 'Build login page interface',
        label: 'Feature',
        assignee: 'John',
        dueDate: '2026-11-28',
      },
      {
        id: 2,
        title: 'Fix Navigation Bug',
        description: 'Fix navigation issue on mobile',
        label: 'Bug',
        assignee: 'Sarah',
        dueDate: '2026-11-29',
      },
    ],
  },
  {
    id: 'doing',
    title: 'Doing',
    tasks: [
      {
        id: 3,
        title: 'Dashboard Layout',
        description: 'Create dashboard layout',
        label: 'Feature',
        assignee: 'Alex',
        dueDate: '2026-11-27',
      },
      {
        id: 6,
        title: 'Deployment',
        description: 'Setup Environment Development Server',
        label: 'Feature',
        assignee: 'Me',
        dueDate: '2026-11-28',
      },
      {
        id: 7,
        title: 'Database Design',
        description: 'Basis Data Design',
        label: 'Feature',
        assignee: 'Me',
        dueDate: '2026-11-28',
      },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [
      {
        id: 4,
        title: 'API Integration',
        description: 'Review API integration',
        label: 'Issue',
        assignee: 'John',
        dueDate: '2026-11-30',
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: 5,
        title: 'Setup Project',
        description: 'Initialize project structure',
        label: 'Feature',
        assignee: 'Sarah',
        dueDate: '2026-11-25',
      },
    ],
  },
  {
    id: 'rework',
    title: 'Rework',
    tasks: [],
  },
];

const Home: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(() => {
    const savedColumns = localStorage.getItem('task-board-data');

    if (savedColumns) {
      try {
        return JSON.parse(savedColumns) as Column[];
      } catch {
        return initialColumns;
      }
    }

    return initialColumns;
  });

  useEffect(() => {
    setColumns(prevColumns =>
        prevColumns.map(column => {
            if (column.id === 'review') {
                return { ...column, title: 'Review' };
            }

            if (column.id === 'rework') {
                return { ...column, title: 'Rework' };
            }

            return column;
        })
    );
  }, []);

  useEffect(() => {
    localStorage.setItem('task-board-data', JSON.stringify(columns));
  }, [columns]);

  const [newTaskColumnId, setNewTaskColumnId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [labelFilter, setLabelFilter] = useState('All');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAssignee =
        assigneeFilter === 'All' || task.assignee === assigneeFilter;

      const matchesLabel =
        labelFilter === 'All' || task.label === labelFilter;
      
      const matchesDueDate =
        dueDateFilter === '' || task.dueDate === dueDateFilter;

      return matchesSearch && matchesAssignee && matchesLabel && matchesDueDate;
    })
  }));

  const assignees = [
    ...new Set(
        columns.flatMap(column =>
            column.tasks.map(task => task.assignee)
        )
    )
  ];
  
  const addTask = (columnId: string) => {
      const newTask: Task = {
          id: Date.now(),
          title: '',
          description: '',
          label: 'Undefined',
          assignee: 'Unassigned',
          dueDate: 'No Date',
          priority: 'Medium',
          checklist: [],
          attachments: [],
      };

      setSelectedTask(newTask);
      setNewTaskColumnId(columnId);
  };

  const deleteTask = (columnId: string, taskId: number) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === columnId ? {
          ...column,
          tasks: column.tasks.filter(
            (task) => task.id !== taskId
          ),
        } : column
      )
    );

    notify('Task successfully deleted!');
  };

  const saveTaskDetails = (updatedData: Partial<Task>) => {
    if (!selectedTask) return;

    // Jika sedang membuat task baru
    if (newTaskColumnId) {
        const newTask = {
            ...selectedTask,
            ...updatedData,
        };

        setColumns(prevColumns =>
            prevColumns.map(column =>
                column.id === newTaskColumnId
                    ? {
                        ...column,
                        tasks: [...column.tasks, newTask],
                    }
                    : column
            )
        );

        setNewTaskColumnId(null);
        notify('Task successfully added!');
        return;
    }

    // Jika sedang mengedit task yang sudah ada
    const column = columns.find(col =>
        col.tasks.some(task => task.id === selectedTask.id)
    );

    if (!column) return;

    updateTask(column.id, selectedTask.id, updatedData);
  };

  const handleDropTask = (targetColumnId: string) => {
    if (draggedTaskId === null) return;

    setColumns(prevColumns => {
      const sourceColumn = prevColumns.find(column =>
        column.tasks.some(task => task.id === draggedTaskId)
      );

      if (!sourceColumn || sourceColumn.id === targetColumnId) {
        return prevColumns;
      }

      const taskToMove = sourceColumn.tasks.find(
        task => task.id === draggedTaskId
      );

      if (!taskToMove) return prevColumns;

      return prevColumns.map(column => {
        if (column.id === sourceColumn.id) {
          return {
            ...column,
            tasks: column.tasks.filter(task => task.id !== draggedTaskId)
          };
        }

        if (column.id === targetColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, taskToMove]
          };
        }

        return column;
      });
    });

    setDraggedTaskId(null);
    notify('Task moved successfully!');
  };

  const updateTask = (
    columnId: string,
    taskId: number,
    updatedData: Partial<Task>
  ) => {
    setColumns(prevColumns =>
      prevColumns.map(column =>
        column.id === columnId
          ? {
              ...column,
              tasks: column.tasks.map(task =>
                task.id === taskId
                  ? { ...task, ...updatedData }
                  : task
              )
            }
          : column
      )
    );

    notify('Task successfully updated!');
  };

  const notify = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="board-content">
        {/* Navbar */}
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          labelFilter={labelFilter}
          setLabelFilter={setLabelFilter}
          dueDateFilter={dueDateFilter}
          setDueDateFilter={setDueDateFilter}
          assignees={assignees}
          onResetFilters={() => {
              setSearchTerm('');
              setAssigneeFilter('All');
              setLabelFilter('All');
              setDueDateFilter('');
          }}
        />

        {/* Main Board */}
        <main className="board-main">
          {/* Kanban Columns */}
          <div className="board-columns">
            {filteredColumns.map((column) => (
              <BoardColumn
                key={column.id}
                title={column.title}
                tasks={column.tasks}
                onAddTask={() => addTask(column.id)}
                onDeleteTask={(taskId) => deleteTask(column.id, taskId)}
                onOpenTask={(task) => setSelectedTask(task)}
                columnId={column.id}
                onDragStart={taskId => setDraggedTaskId(taskId)}
                onDropTask={handleDropTask}
              />
            ))}
          </div>

          <TaskDetailModal
            isOpen={selectedTask !== null}
            task={selectedTask}
            onClose={() => {
              setSelectedTask(null);
              setNewTaskColumnId(null);
            }}
            onSave={saveTaskDetails}
            assignees={assignees}
          />  

          <IonToast
            isOpen={showToast}
            message={toastMessage}
            duration={2000}
            position="bottom"
            color="success"
            onDidDismiss={() => setShowToast(false)}
          />
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Home;