import { Form, Head, usePage } from '@inertiajs/react';
import { useState, useEffect, ChangeEvent } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useInitials } from '@/hooks/use-initials';
import { Camera } from 'lucide-react';

type PageProps = {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            avatar_url?: string | null;
        };
    };
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const getInitials = useInitials();
    
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url ?? null);

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        } else {
            setAvatarPreview(user.avatar_url ?? null);
        }
    };

    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    return (
        <div className="space-y-6">
            <Head title="Profile settings" />

            <Form
                {...ProfileController.update.form()}
                options={{ preserveScroll: true }}
                encType="multipart/form-data"
            >
                {({ errors, processing }) => (
                    // GINAWANG 5 COLUMNS PARA MAGAMIT ANG SPACE (2 para sa Avatar, 3 para sa Info)
                    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-5">
                        
                        {/* LEFT: AVATAR CARD (2 Columns) */}
                        <Card className="flex h-full flex-col md:col-span-2">
                            <CardHeader className="pb-4 text-center">
                                <CardTitle className="text-base font-semibold">Profile Picture</CardTitle>
                            </CardHeader>
                            {/* GINAWANG flex-1 AT justify-center PARA MAG-STRETCH AT MAG-CENTER */}
                            <CardContent className="flex flex-1 flex-col items-center justify-center gap-6">
                                <Avatar className="h-40 w-40 border-4 border-primary/10 shadow-sm">
                                    <AvatarImage src={avatarPreview ?? undefined} alt={user.name} />
                                    <AvatarFallback className="bg-primary/5 text-4xl font-bold text-primary">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="w-full max-w-[250px]">
                                    <Label
                                        htmlFor="avatar"
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 px-4 py-3 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                    >
                                        <Camera className="h-4 w-4" />
                                        Update Avatar
                                    </Label>
                                    <Input
                                        id="avatar"
                                        type="file"
                                        name="avatar"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                    <p className="mt-3 text-center text-xs text-muted-foreground">
                                        JPG, PNG or WEBP. Max 2MB.
                                    </p>
                                    <InputError className="mt-2 text-center" message={errors.avatar} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* RIGHT: INFO CARD (3 Columns) */}
                        <Card className="flex h-full flex-col md:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
                                <CardDescription>Update your display name and email address.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        defaultValue={user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        className="h-10"
                                        placeholder="Full name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        defaultValue={user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        className="h-10"
                                        placeholder="Email address"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </CardContent>
                            {/* MT-AUTO PARA DUMIKIT SA PINAKA-ILALIM */}
                            <CardFooter className="mt-auto flex items-center justify-end border-t bg-muted/20 px-6 py-4">
                                <Button disabled={processing} type="submit" className="min-w-[120px] cursor-pointer">
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </Form>

            <div className="mt-12 rounded-xl border border-red-200 bg-red-50/30 p-6">
                <DeleteUser />
            </div>
        </div>
    );
}