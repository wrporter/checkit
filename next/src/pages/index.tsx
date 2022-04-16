import Link from 'next/link';
import { useSession } from 'next-auth/react';

import Button from '@/components/Button';
import Header from '@/components/Header';
import { Meta } from '@/layout/Meta';
import { Main } from '@/templates/Main';

const Index = () => {
  const { data: session } = useSession();

  return (
    <Main
      meta={<Meta title="Checkit" description="Get more done with Checkit!" />}
    >
      <div className="flex h-full min-h-screen flex-col bg-gradient-to-r from-lime-300 to-cyan-400">
        <Header />

        <main className="relative sm:flex sm:items-center sm:justify-center">
          <div className="relative sm:pb-16 sm:pt-8">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pb-16 lg:pt-32">
                <h2 className="text-center text-5xl tracking-tight sm:text-6xl lg:text-6xl">
                  <span className="block drop-shadow-md">
                    Get more done with Checkit!
                  </span>
                </h2>
                <p className="mx-auto mt-6 max-w-lg text-center text-xl sm:max-w-3xl">
                  Use state of the art technology to be your most productive
                  self. The most simplified todo list application ever!
                </p>
                <div className="mt-10 flex justify-center">
                  {session?.user ? (
                    <Link href="/home">
                      <Button as="span">View your items</Button>
                    </Link>
                  ) : (
                    <Link href="/signup">
                      <Button as="span">Get started</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Main>
  );
};

export default Index;
