import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Profil</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Gérez vos informations personnelles et la sécurité de votre compte.</p>
                </div>
            }
        >
            <Head title="Profil" />

            <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
                <div className="rounded-2xl border border-slate-200/60 bg-white/85 p-5 backdrop-blur-xl sm:rounded-3xl sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-2xl border border-slate-200/60 bg-white/85 p-5 backdrop-blur-xl sm:rounded-3xl sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="rounded-2xl border border-red-200/60 bg-white/85 p-5 backdrop-blur-xl sm:rounded-3xl sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
