import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';

type Props = {
    status?: string;
};

export default function Login({ status }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--color-dark-brown)">
            <Head title="Admin Login" />

            <div className="absolute inset-0 z-0">
                <img
                    src="/images/kib.png"
                    alt="Kiblawan Background"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-(--color-dark-brown)/85" />
            </div>

            <div className="relative z-10 w-full max-w-md p-4">
                <div className="rounded-[24px] border border-line bg-white p-8 shadow-k-deep sm:p-10">
                    <div className="mb-8 text-center">
                        <img
                            src="/images/image.webp"
                            alt="Kiblawan Logo"
                            width={80}
                            height={80}
                            className="mx-auto mb-6 h-20 w-20"
                            fetchPriority="high"
                        />
                        <h1 className="mb-2 font-display text-3xl font-bold text-primary">
                            Admin Portal
                        </h1>
                        <p className="text-sm text-ink-muted">
                            Municipality of Kiblawan
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 rounded-lg border border-green/20 bg-green-soft p-3 text-center text-sm font-medium text-green-dark">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        {Object.keys(errors).length > 0 && (
                            <div
                                role="alert"
                                className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700"
                            >
                                {errors.email ||
                                    errors.password ||
                                    'Invalid credentials. Please try again.'}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-foreground">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder="admin@kiblawan.gov.ph"
                                className="bg-white"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className="text-foreground"
                            >
                                Password
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="bg-white"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="mt-4 w-full py-6 text-base font-semibold"
                        >
                            {processing ? <Spinner className="mr-2" /> : null}
                            Log In
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

Login.layout = (page: React.ReactNode) => page;
