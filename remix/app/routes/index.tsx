import { Link } from '@remix-run/react';

import { useOptionalUser } from '~/utils';
import Button from '~/components/Button';

export default function Index() {
    const user = useOptionalUser();

    return (
        <main className="relative h-full bg-gradient-to-r from-lime-300 to-cyan-400 sm:flex sm:justify-center">
            <div className="relative sm:pb-16 sm:pt-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="lg:pb-18 relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-32">
                        <h2 className="text-center text-5xl tracking-tight sm:text-6xl lg:text-7xl">
                            <span className="block drop-shadow-md">
                                Get more done with Checkit!
                            </span>
                        </h2>
                        <p className="mx-auto mt-6 max-w-lg text-center text-xl sm:max-w-3xl">
                            Use state of the art technology to be your most
                            productive self. The most simplified todo list
                            application ever!
                        </p>
                        <div className="mt-10 flex justify-center">
                            {user ? (
                                <Button as={Link} to="/home">
                                    View your items
                                </Button>
                            ) : (
                                <Button as={Link} to="/signup">
                                    Get started
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
