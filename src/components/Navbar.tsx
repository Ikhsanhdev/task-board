import './Navbar.css';
import {IonPopover, IonDatetime, IonModal} from '@ionic/react';
import { useState } from 'react';

type NavbarProps = {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    assigneeFilter: string;
    setAssigneeFilter: (value: string) => void;
    labelFilter: string;
    setLabelFilter: (value: string) => void;
    dueDateFilter: string;
    setDueDateFilter: (value: string) => void;
    assignees: string[];
    onResetFilters: () => void;
};

const Navbar: React.FC<NavbarProps> = ({
    searchTerm,
    setSearchTerm,
    assigneeFilter,
    setAssigneeFilter,
    labelFilter,
    setLabelFilter,
    dueDateFilter,
    setDueDateFilter,
    assignees,
    onResetFilters
}) => {
    const [popoverState, setPopoverState] = useState<{
        open: boolean;
        event?: Event;
    }>({ open: false });

    return (
        <header className="board-navbar">
            <div className="navbar-top">
                <div className="navbar-brand">
                    <div className="brand-icon">A</div>
                    <span>TaskBoard</span>
                </div>

                <span className="board-name">
                    Project Management
                </span>
            </div>

            <div className="navbar-filters">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />

                <select
                    value={assigneeFilter}
                    onChange={e => setAssigneeFilter(e.target.value)}
                >
                    <option value="All">All Assignees</option>
                    {assignees.map(assignee => (
                        <option key={assignee} value={assignee}>
                            {assignee}
                        </option>
                    ))}
                </select>

                <select
                    value={labelFilter}
                    onChange={e => setLabelFilter(e.target.value)}
                >
                    <option value="All">All Labels</option>
                    <option value="Feature">Feature</option>
                    <option value="Bug">Bug</option>
                    <option value="Issue">Issue</option>
                    <option value="Undefined">Undefined</option>
                </select>

                <div className="navbar-date-filter">
                    <button
                        type="button"
                        className="date-picker-trigger"
                        onClick={(e) => setPopoverState({ open: true, event: e.nativeEvent })}
                    >
                        <span>📅</span>
                        {dueDateFilter
                            ? new Date(dueDateFilter + 'T00:00:00').toLocaleDateString('id-ID', {
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
                            value={dueDateFilter || undefined}
                            onIonChange={(e) => {
                                const value = e.detail.value;

                                if (typeof value === 'string') {
                                    setDueDateFilter(value.slice(0, 10));
                                    setPopoverState({ open: false });
                                }
                            }}
                        />
                    </IonPopover>
                </div>

                <button
                    className="reset-filter-btn"
                    onClick={onResetFilters}
                >
                    Reset
                </button>
            </div>
        </header>
    );
};

export default Navbar;