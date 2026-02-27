import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import {useForm, usePage} from "@inertiajs/react";

export default function RegisterUserAsSupervisor() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        // email: "",
        password: "",
    });

    const supervisorEmail = usePage().props.auth.user.email;

    const submit = (e) => {
        e.preventDefault();

        // const userEmail = data.email
        //     ? data.email
        //     : `${data.name.replace(/\s+/g, ".").toLowerCase()}@${supervisorEmail}`;

        // setData("email", userEmail);

        console.log("Gegevens voor POST:", data); // Debug log

        post(route("registerbysupervisor"), {
            onFinish: () => reset("password"),
        });
    };


    return (
        <div className="flex justify-center items-center bg-gray-50">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="name" value="Naam"/>

                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                        />

                        <InputError message={errors.name} className="mt-2"/>
                    </div>

{/*                    <div className="mt-4">
                        <InputLabel htmlFor="email" value="E-mail (optioneel)"/>

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder={`Bijv. ${supervisorEmail}`}
                        />

                        <InputError message={errors.email} className="mt-2"/>
                    </div>*/}

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Wachtwoord"/>

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            onChange={(e) => setData("password", e.target.value)}
                            required
                        />

                        <InputError message={errors.password} className="mt-2"/>
                    </div>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Herhaal wachtwoord"
                        />

                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />

                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4 flex justify-center">
                        <PrimaryButton disabled={processing}>
                            Gebruiker Registreren
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
