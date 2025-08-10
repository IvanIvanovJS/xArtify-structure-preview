"use client";

import React from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = React.use(params);

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
            <ResetPasswordForm token={token} />
        </div>
    );
}
