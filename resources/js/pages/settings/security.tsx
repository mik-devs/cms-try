import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import ManageTwoFactor from '@/components/manage-two-factor';
import ManagePasskeys from '@/components/manage-passkeys';
import { Lock, ShieldCheck, KeyRound } from 'lucide-react';

interface ManagePasskeysProps {
    canManagePasskeys: boolean;
    passkeys: any[];
}

interface ManageTwoFactorProps {
    canManageTwoFactor: boolean;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
}

type Props = {
    passwordRules: string;
} & ManagePasskeysProps & ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            <Head title="Security settings" />
            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-6">
                {/* PASSWORD CARD */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Lock className="h-5 w-5 text-primary" /> Update Password
                        </CardTitle>
                        <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                    </CardHeader>
                    <Form
                        {...SecurityController.update.form()}
                        options={{ preserveScroll: true }}
                        resetOnError={['password', 'password_confirmation', 'current_password']}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) passwordInput.current?.focus();
                            if (errors.current_password) currentPasswordInput.current?.focus();
                        }}
                    >
                        {({ processing, errors }) => (
                            <>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Current Password</Label>
                                        <PasswordInput
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            autoComplete="current-password"
                                            placeholder="Enter current password"
                                            className="h-10"
                                        />
                                        <InputError message={errors.current_password} />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">New Password</Label>
                                            <PasswordInput
                                                ref={passwordInput}
                                                name="password"
                                                autoComplete="new-password"
                                                placeholder="Enter new password"
                                                passwordrules={props.passwordRules}
                                                className="h-10"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                                            <PasswordInput
                                                name="password_confirmation"
                                                autoComplete="new-password"
                                                placeholder="Confirm new password"
                                                passwordrules={props.passwordRules}
                                                className="h-10"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="mt-auto flex items-center justify-end border-t bg-muted/20 px-6 py-4">
                                    <Button disabled={processing} type="submit" className="cursor-pointer">
                                        Save Password
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                    </Form>
                </Card>

                {/* 2FA CARD */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <ShieldCheck className="h-5 w-5 text-primary" /> Two-Factor Authentication
                        </CardTitle>
                        <CardDescription>Add an extra layer of security to your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ManageTwoFactor
                            canManageTwoFactor={props.canManageTwoFactor}
                            requiresConfirmation={props.requiresConfirmation}
                            twoFactorEnabled={props.twoFactorEnabled}
                        />
                    </CardContent>
                </Card>

                {/* PASSKEYS CARD */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <KeyRound className="h-5 w-5 text-primary" /> Passkeys
                        </CardTitle>
                        <CardDescription>Sign in securely without a password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ManagePasskeys
                            canManagePasskeys={props.canManagePasskeys}
                            passkeys={props.passkeys}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}