"use client";

import { useState, useEffect } from "react";
import type { FC, ReactElement } from "react";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    _count: {
        paintings: number;
        enrollments: number;
    };
}

interface UserManagementProps {
    onUserPromoted?: () => void;
}

const UserManagement: FC<UserManagementProps> = ({ onUserPromoted }): ReactElement => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [promotingUser, setPromotingUser] = useState<string | null>(null);
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [promoteReason, setPromoteReason] = useState("");
    const [newRole, setNewRole] = useState<"USER" | "ARTIST" | "ADMIN">("USER");

    const fetchUsers = async (page: number = 1, search: string = "", role: string = "") => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(search && { search }),
                ...(role && { role })
            });

            const response = await fetch(`/api/admin/promote-user?${params}`);
            if (!response.ok) {
                throw new Error("Грешка при зареждане на потребителите");
            }

            const data = await response.json();
            setUsers(data.users);
            setTotalPages(data.pagination.totalPages);
            setCurrentPage(data.pagination.page);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестна грешка");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage, searchTerm, roleFilter);
    }, [currentPage, searchTerm, roleFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers(1, searchTerm, roleFilter);
    };

    const handlePromoteUser = async () => {
        if (!selectedUser || !promoteReason.trim()) return;

        try {
            setPromotingUser(selectedUser.id);
            const response = await fetch("/api/admin/promote-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    newRole,
                    reason: promoteReason.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Грешка при промяна на ролята");
            }

            // Обновяване на списъка с потребители
            await fetchUsers(currentPage, searchTerm, roleFilter);

            // Затваряне на модала
            setShowPromoteModal(false);
            setSelectedUser(null);
            setPromoteReason("");
            setNewRole("USER");

            // Извикване на callback ако е предоставен
            if (onUserPromoted) {
                onUserPromoted();
            }

            alert(data.message || "Ролята беше успешно променена");

        } catch (err) {
            alert(err instanceof Error ? err.message : "Неизвестна грешка");
        } finally {
            setPromotingUser(null);
        }
    };

    const openPromoteModal = (user: User) => {
        setSelectedUser(user);
        setNewRole(user.role as "USER" | "ARTIST" | "ADMIN");
        setShowPromoteModal(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("bg-BG", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "ADMIN": return "admin-role-badge--admin";
            case "ARTIST": return "admin-role-badge--artist";
            default: return "admin-role-badge--user";
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="user-management">
                <div className="user-management__loading">
                    <div className="loading-spinner"></div>
                    <p>Зареждане на потребители...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-management">
            <div className="user-management__header">
                <h1>Управление на потребители</h1>
                <p>Промяна на роли и управление на акаунти</p>
            </div>

            {/* Search and Filters */}
            <div className="user-management__filters">
                <form onSubmit={handleSearch} className="user-management__search">
                    <input
                        type="text"
                        placeholder="Търсене по име или email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-input"
                    />
                    <button type="submit" className="admin-btn admin-btn--primary">
                        Търси
                    </button>
                </form>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="admin-select"
                >
                    <option value="">Всички роли</option>
                    <option value="USER">Потребители</option>
                    <option value="ARTIST">Художници</option>
                    <option value="ADMIN">Админи</option>
                </select>
            </div>

            {error && (
                <div className="user-management__error">
                    <p>{error}</p>
                    <button
                        onClick={() => fetchUsers(currentPage, searchTerm, roleFilter)}
                        className="admin-btn admin-btn--secondary"
                    >
                        Опитай отново
                    </button>
                </div>
            )}

            {/* Users Table */}
            <div className="user-management__table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Потребител</th>
                            <th>Роля</th>
                            <th>Регистрация</th>
                            <th>Активност</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="admin-user-info">
                                        <div className="admin-user-info__name">
                                            {user.name || "Без име"}
                                        </div>
                                        <div className="admin-user-info__email">
                                            {user.email}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`admin-role-badge ${getRoleColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className="admin-date">
                                        {formatDate(user.createdAt)}
                                    </span>
                                </td>
                                <td>
                                    <div className="admin-activity">
                                        <span>{user._count.paintings} картини</span>
                                        <span>{user._count.enrollments} курсове</span>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        onClick={() => openPromoteModal(user)}
                                        className="admin-btn admin-btn--small admin-btn--primary"
                                        disabled={promotingUser === user.id}
                                    >
                                        {promotingUser === user.id ? "Променя..." : "Промени роля"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="user-management__pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="admin-btn admin-btn--secondary"
                    >
                        Предишна
                    </button>

                    <span className="admin-pagination-info">
                        Страница {currentPage} от {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="admin-btn admin-btn--secondary"
                    >
                        Следваща
                    </button>
                </div>
            )}

            {/* Promote User Modal */}
            {showPromoteModal && selectedUser && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h2>Промяна на роля</h2>
                            <button
                                onClick={() => setShowPromoteModal(false)}
                                className="admin-modal__close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-modal__content">
                            <div className="admin-modal__user-info">
                                <h3>{selectedUser.name || "Без име"}</h3>
                                <p>{selectedUser.email}</p>
                                <p>Текуща роля: <span className={`admin-role-badge ${getRoleColor(selectedUser.role)}`}>
                                    {selectedUser.role}
                                </span></p>
                            </div>

                            <div className="admin-modal__form">
                                <label className="admin-label">
                                    Нова роля:
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value as "USER" | "ARTIST" | "ADMIN")}
                                        className="admin-select"
                                    >
                                        <option value="USER">Потребител</option>
                                        <option value="ARTIST">Художник</option>
                                        <option value="ADMIN">Администратор</option>
                                    </select>
                                </label>

                                <label className="admin-label">
                                    Причина за промяната:
                                    <textarea
                                        value={promoteReason}
                                        onChange={(e) => setPromoteReason(e.target.value)}
                                        placeholder="Опишете причината за промяна на ролята..."
                                        className="admin-textarea"
                                        rows={4}
                                        required
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="admin-modal__footer">
                            <button
                                onClick={() => setShowPromoteModal(false)}
                                className="admin-btn admin-btn--secondary"
                            >
                                Отказ
                            </button>
                            <button
                                onClick={handlePromoteUser}
                                disabled={!promoteReason.trim() || promotingUser === selectedUser.id}
                                className="admin-btn admin-btn--primary"
                            >
                                {promotingUser === selectedUser.id ? "Променя..." : "Потвърди промяната"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
