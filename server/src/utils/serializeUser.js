// Strips sensitive fields and maps snake_case DB columns to the camelCase
// shape the frontend expects (Mongo-style _id included for compatibility).
export const serializeUser = (row) => {
    if (!row) return null;
    return {
        _id: row.id,
        id: row.id,
        username: row.username,
        email: row.email,
        fullName: row.full_name,
        avatar: row.avatar,
        isEmailVerified: row.is_verified,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
};
