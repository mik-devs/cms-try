import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PasskeyVerify from '@/components/passkey-verify';
import { store } from '@/routes/password/confirm';
import { confirm, confirmOptions } from '@/routes/passkey';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm Password" />
            
            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-sm font-medium text-ink">
                                Password
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                autoFocus
                                className="w-full rounded-lg border border-line p-3 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button 
                            disabled={processing} 
                            type="submit" 
                            className="h-12 w-full cursor-pointer rounded-xl bg-primary px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        >
                            {processing ? 'Confirming...' : 'Confirm Password'}
                        </Button>
                    </div>
                )}
            </Form>

            <div className="mt-6 border-t border-line/50 pt-6">
                <PasskeyVerify
                    routes={{
                        options: { url: confirmOptions().url, method: 'get' },
                        submit: { url: confirm().url, method: 'post' },
                    }}
                    label="Confirm with passkey"
                    loadingLabel="Confirming..."
                    separator="Or"
                />
            </div>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Confirm Password',
    description: 'This is a secure area. Please confirm your password before continuing.',
};